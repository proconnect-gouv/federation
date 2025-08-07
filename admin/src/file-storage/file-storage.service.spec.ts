import { ObjectID } from 'mongodb';
import { ConfigService } from 'nestjs-config';
import * as Joi from '@hapi/joi';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { FileStorageService } from './file-storage.service';
import { FileStorage } from './file-storage.mongodb.entity';

jest.mock('uuid');
import { v4 as uuidv4 } from 'uuid';

describe('FileStorageService', () => {
  const originalDateNow = Date.now;

  let module: TestingModule;
  let fileStorageService: FileStorageService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const file = {
    id: new ObjectID('5d662c66b8e03e2912315da4'),
    fieldname: 'logo',
    originalname: '   Logo    with some     spaces   .png',
    encoding: '7bits',
    mimetype: 'image/png',
    buffer: Buffer.from('myimage'),
    size: 4200,
  };

  const filenameAsSaved = '4242424242424_Logo_with_some_spaces_.png';

  const toArrayMock = jest.fn();
  const gridFSBucketMock = {
    openUploadStream: jest.fn(),
    openDownloadStreamByName: jest.fn(),
    delete: jest.fn(),
    find: jest.fn(),
  };

  const readStreamMock = jest.fn();

  const dbMock = jest.fn();

  const FileStorageRepositoryMock = {
    manager: {
      connection: {
        driver: {
          queryRunner: {
            databaseConnection: {
              db: dbMock,
            },
          },
          mongodb: {
            GridFSBucket: function GridFSBucket(db) {
              return gridFSBucketMock;
            },
          },
        },
      },
    },
  };

  beforeEach(async () => {
    Date.now = jest.fn().mockReturnValue('4242424242424');

    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([FileStorage], 'fc-mongo')],
      providers: [FileStorageService, FileStorage, ConfigService],
    })
      .overrideProvider(getRepositoryToken(FileStorage, 'fc-mongo'))
      .useValue(FileStorageRepositoryMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    fileStorageService = await module.get<FileStorageService>(
      FileStorageService,
    );
    jest.resetAllMocks();
  });

  afterAll(async () => {
    Date.now = originalDateNow;
    module.close();
  });

  describe('onModuleInit', () => {
    it('should instantiate the gridFSBucket', async () => {
      // setup
      configServiceMock.get.mockReturnValueOnce({
        dbName: 'dbName',
      });

      // action
      await fileStorageService.onModuleInit();

      // expect
      expect(dbMock).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock).toHaveProperty('delete');
      expect(gridFSBucketMock).toHaveProperty('find');
      expect(gridFSBucketMock).toHaveProperty('openDownloadStreamByName');
      expect(gridFSBucketMock).toHaveProperty('openUploadStream');
    });
  });

  describe('storeFile', () => {
    beforeEach(async () => {
      configServiceMock.get.mockReturnValueOnce({
        dbName: 'dbName',
      });
      gridFSBucketMock.openUploadStream.mockReturnValue({
        end: jest.fn().mockImplementation((buffer: Buffer, cb) => {
          cb(null, file);
        }),
      });

      await fileStorageService.onModuleInit();
    });

    it('should remove and replace unecessaries spaces in filename before storing the file', async () => {
      // action
      await fileStorageService.storeFile(file);

      // expect
      expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledWith(
        `${Date.now()}${file.originalname.replace(/\s+/g, '_')}`,
        expect.anything(),
      );
    });

    it('should insert the file contentType from mimetype and the encoding to metadata in database', async () => {
      // action
      await fileStorageService.storeFile(file);

      // expect
      expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledWith(
        expect.anything(),
        {
          contentType: file.mimetype,
          metadata: { encoding: file.encoding },
        },
      );
    });

    it('should throw an error if there is no file to store', async () => {
      // action
      try {
        await fileStorageService.storeFile(undefined);
      } catch (e) {
        // expect
        expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledTimes(0);
        expect(e.message).toBe("Aucun logo valide n'a été fourni");
      }
      expect.hasAssertions();
    });

    it('should throw an error if there is an error when writing on the stream', async () => {
      // setup
      gridFSBucketMock.openUploadStream.mockReturnValue({
        end: jest.fn().mockImplementation((buffer: Buffer, cb) => {
          cb(new Error('Unexpected stream error :('), undefined);
        }),
      });

      // action
      try {
        await fileStorageService.storeFile(file);
      } catch (e) {
        // expect
        expect(gridFSBucketMock.openUploadStream).toHaveBeenCalledTimes(1);
        expect(e.message).toBe('Unexpected stream error :(');
      }
      expect.hasAssertions();
    });
  });

  describe('getFileAsDataUri', () => {
    beforeEach(async () => {
      configServiceMock.get.mockReturnValueOnce({
        dbName: 'dbName',
      });
      gridFSBucketMock.find.mockReturnValue({
        toArray: toArrayMock.mockResolvedValue([
          {
            contentType: file.mimetype,
            metadata: { encoding: file.encoding },
          },
        ]),
      });

      gridFSBucketMock.openDownloadStreamByName.mockReturnValue({
        on: jest.fn().mockImplementation((event: string, cb) => {
          switch (event) {
            case 'data':
              cb(file.buffer);
              break;
            case 'end': {
              cb();
              break;
            }
          }
        }),
        read: readStreamMock,
      });

      await fileStorageService.onModuleInit();
    });

    it('should retrieve file informations and then download the file itself from gridfs', async () => {
      // action
      await fileStorageService.getFileAsDataUri(filenameAsSaved);

      // expect
      expect(readStreamMock).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledWith({
        filename: filenameAsSaved,
      });
      expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledTimes(
        1,
      );
      expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledWith(
        filenameAsSaved,
      );
    });

    it('should return the file as data uri', async () => {
      // action
      const fileAsDataUri = await fileStorageService.getFileAsDataUri(
        filenameAsSaved,
      );

      // expect
      expect(fileAsDataUri).toBe(
        `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
      );
    });

    it('should retrieve file informations and then download the file itself from gridfs with multiple data event on the stream', async () => {
      // setup
      gridFSBucketMock.openDownloadStreamByName.mockReturnValue({
        on: jest.fn().mockImplementation((event: string, cb) => {
          switch (event) {
            case 'data':
              // equivalent to multiple data event
              cb(file.buffer);
              cb(file.buffer);
              cb(file.buffer);
              break;
            case 'end': {
              cb();
              break;
            }
          }
        }),
        read: readStreamMock,
      });

      // action
      const fileAsDataUri = await fileStorageService.getFileAsDataUri(
        filenameAsSaved,
      );

      // expect
      expect(readStreamMock).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledWith({
        filename: filenameAsSaved,
      });
      expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledTimes(
        1,
      );
      expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledWith(
        filenameAsSaved,
      );
      expect(fileAsDataUri).toBe(
        'data:image/png;base64,bXlpbWFnZW15aW1hZ2VteWltYWdl',
      );
    });

    it('should throw an error if the stream emit an error event', async () => {
      // setup
      gridFSBucketMock.openDownloadStreamByName.mockReturnValue({
        on: jest.fn().mockImplementation((event: string, cb) => {
          switch (event) {
            case 'error':
              cb(new Error('Unexpected stream error :('));
              break;
          }
        }),
        read: readStreamMock,
      });

      // action
      try {
        const fileAsDataUri = await fileStorageService.getFileAsDataUri(
          filenameAsSaved,
        );
      } catch (e) {
        // expect
        expect(readStreamMock).toHaveBeenCalledTimes(1);
        expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
        expect(gridFSBucketMock.find).toHaveBeenCalledWith({
          filename: filenameAsSaved,
        });
        expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledTimes(
          1,
        );
        expect(gridFSBucketMock.openDownloadStreamByName).toHaveBeenCalledWith(
          filenameAsSaved,
        );
        expect(e.message).toBe('Unexpected stream error :(');
      }
      expect.hasAssertions();
    });

    it('should return return "undefined" if there is no file corresponding', async () => {
      // setup
      gridFSBucketMock.find.mockReturnValue({
        toArray: toArrayMock.mockResolvedValue([]),
      });

      // action
      const fileAsDataUri = await fileStorageService.getFileAsDataUri(
        filenameAsSaved,
      );

      // expect
      expect(readStreamMock).toHaveBeenCalledTimes(0);
      expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledWith({
        filename: filenameAsSaved,
      });
      expect(fileAsDataUri).toBe(undefined);
    });
  });

  describe('deleteFile', () => {
    beforeEach(async () => {
      configServiceMock.get.mockReturnValueOnce({
        dbName: 'dbName',
      });
      gridFSBucketMock.find.mockReturnValue({
        toArray: toArrayMock.mockResolvedValue([
          {
            _id: file.id,
            contentType: file.mimetype,
            metadata: { encoding: file.encoding },
          },
        ]),
      });

      gridFSBucketMock.delete.mockImplementation((id, cb) => {
        cb();
      });

      await fileStorageService.onModuleInit();
    });

    it('should retrieve file informations and then delete it from GridFS', async () => {
      // action
      const result = await fileStorageService.deleteFile(filenameAsSaved);

      // expect
      expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledWith({
        filename: filenameAsSaved,
      });
      expect(gridFSBucketMock.delete).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.delete).toHaveBeenCalledWith(
        file.id,
        expect.anything(),
      );
      expect(result).toEqual({
        _id: file.id,
        contentType: file.mimetype,
        metadata: { encoding: file.encoding },
      });
    });

    it('should return return "undefined" if there is no file corresponding', async () => {
      // setup
      gridFSBucketMock.find.mockReturnValue({
        toArray: toArrayMock.mockResolvedValue([]),
      });

      // action
      const result = await fileStorageService.deleteFile(filenameAsSaved);
      // expect
      expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
      expect(gridFSBucketMock.find).toHaveBeenCalledWith({
        filename: filenameAsSaved,
      });
      expect(result).toBe(undefined);
    });

    it('should throw an error if the file informations are found but GridFS delete fail', async () => {
      // setup
      gridFSBucketMock.delete.mockImplementation((id, cb) => {
        cb(new Error('Oops ! Fail !'));
      });

      // action
      try {
        await fileStorageService.deleteFile(filenameAsSaved);
      } catch (e) {
        // expect
        expect(gridFSBucketMock.find).toHaveBeenCalledTimes(1);
        expect(gridFSBucketMock.find).toHaveBeenCalledWith({
          filename: filenameAsSaved,
        });
        expect(gridFSBucketMock.delete).toHaveBeenCalledTimes(1);
        expect(gridFSBucketMock.delete).toHaveBeenCalledWith(
          file.id,
          expect.anything(),
        );
        expect(e.message).toBe('Oops ! Fail !');
      }
      expect.hasAssertions();
    });
  });

  describe('fromBase64', () => {
    const correctImgMock =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAXwAAADI\
    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';

    const failedImgMock = 'hello world';

    const failedFormatMock =
      'data:application/pdf;base64,iVBORw0KGgoAAAANSUhEUgAAAXwAAADI\
    BAMAAAAZ5UcuAAAAG1BMVEXMzMyWlpacnJyqqqrFxcWxsbGjo6O3t7e+vr6He3KoAAAACXBIWXMAAA\
    7EAAAOxAGVKw4bAAAFJklEQVR4nO2bzW/bRhDFhx8SdeRSsdwjlbi1j1bbADmStuPmKAlp0KMUuHCOk\
    hq4Vyltgv7ZnZldShQl20ELSXT7foDJJXcEP63ezg4XIB';

    describe('should transform dataURI to FileStorage', () => {
      it('without name', async () => {
        // Arrange

        const filename = 'mockedfilename';
        // uuidv4 is fully mocked by the jest.mock("uuid") on top
        (uuidv4 as jest.Mock).mockReturnValue(filename);

        // Action
        const result = FileStorageService.fromBase64(correctImgMock);

        // Assert;
        expect(result).toBeTruthy();
        const fileSchema = Joi.object({
          originalname: Joi.string().required(),
          mimetype: Joi.string()
            .regex(/^image\/([a-z]{3,4})/)
            .required(),
          size: Joi.number()
            .min(1000)
            .max(2000),
          buffer: Joi.binary().required(),
          encoding: Joi.string().required(),
        });
        const options = { allowUnknown: false };
        const validate = await fileSchema.validateAsync(result, options);
        const { originalname, mimetype, encoding, size, buffer } = validate;
        expect(originalname).toEqual(filename + '.png');
        expect(mimetype).toEqual('image/png');
        expect(size).toEqual(1435);
        expect(encoding).toEqual('buffer');
        expect(buffer).toBeTruthy();
      });
      it('with name', async () => {
        // Arrange
        const name = 'franceconnect';

        // Action
        const result = FileStorageService.fromBase64(correctImgMock, name);

        // Assert;
        expect(result).toBeTruthy();
        const fileSchema = Joi.object({
          originalname: Joi.string().required(),
          mimetype: Joi.string()
            .regex(/^image\/([a-z]{3,4})/)
            .required(),
          size: Joi.number()
            .min(1000)
            .max(2000),
          buffer: Joi.binary().required(),
          encoding: Joi.string().required(),
        });
        const options = { allowUnknown: false };
        const validate = await fileSchema.validateAsync(result, options);
        const { originalname, mimetype, encoding, size, buffer } = validate;
        expect(originalname).toEqual(name + '.png');
        expect(mimetype).toEqual('image/png');
        expect(size).toEqual(1435);
        expect(encoding).toEqual('buffer');
        expect(buffer).toBeTruthy();
      });
    });

    describe('should failed to transform dataURI to FileStorage', () => {
      it('with wrong image', () => {
        // Arrange
        const error = 'dataURI miss format or void';

        // Action
        // Assert
        expect(() => FileStorageService.fromBase64(failedImgMock)).toThrowError(
          error,
        );
      });
      it('with wrong base64 format', () => {
        // Arrange
        const error = 'wrong format of file in dataURI';

        // Action
        // Assert
        expect(() =>
          FileStorageService.fromBase64(failedFormatMock),
        ).toThrowError(error);
      });
    });
  });
});
