import { MongoDriver } from 'typeorm/driver/mongodb/MongoDriver';
import { Repository } from 'typeorm';
import { ConfigService } from 'nestjs-config';
import { v4 as uuid } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { FileStorage } from './file-storage.mongodb.entity';

export class FileStorageService {
  private gridFSBucket;

  constructor(
    @InjectRepository(FileStorage, 'fc-mongo')
    private readonly fileRepository: Repository<FileStorage>,
    private readonly config: ConfigService,
  ) {}

  async onModuleInit() {
    const { dbName } = await this.config.get('mongo-database');
    const mongoDriver = this.fileRepository.manager.connection
      .driver as MongoDriver;
    const nativeConnection = mongoDriver.queryRunner.databaseConnection;

    this.gridFSBucket = new mongoDriver.mongodb.GridFSBucket(
      nativeConnection.db(dbName),
    );
  }

  /**
   * Take a file and upload it to GridFS on mongo
   * @param {FileStorage} file   A file as returned by multer memory storage
   * @return {Promise}           Resolved with data uploaded or with error
   */
  async storeFile(file: FileStorage): Promise<any> {
    if (!file) {
      throw new Error("Aucun logo valide n'a été fourni");
    }

    const fileCopy = new FileStorage();

    Object.assign(fileCopy, file);

    fileCopy.originalname = fileCopy.originalname.trim().replace(/\s+/g, '_');
    fileCopy.originalname = `${Date.now()}_${fileCopy.originalname}`;

    const stream = this.gridFSBucket.openUploadStream(fileCopy.originalname, {
      contentType: fileCopy.mimetype,
      metadata: { encoding: fileCopy.encoding },
    });

    const writeFileToGridFS: Promise<any> = new Promise((resolve, reject) => {
      stream.end(fileCopy.buffer, (err, data) => {
        if (err) {
          return reject(err);
        }
        return resolve(data);
      });
    });

    return writeFileToGridFS;
  }

  /**
   * Get a file GridFS with its name and return it as dataUri
   * @param {string} filename The name of the file in GridFS
   */
  async getFileAsDataUri(filename: string): Promise<string> {
    const filesInfos = await this.gridFSBucket
      .find({
        filename,
      })
      .toArray();

    if (filesInfos.length !== 1) {
      return undefined;
    }

    const fileInfos = filesInfos[0];

    const stream = this.gridFSBucket.openDownloadStreamByName(filename);
    const fileFromGridFS: Promise<string> = new Promise((resolve, reject) => {
      const dataArray = [];

      stream.on('data', data => {
        dataArray.push(data);
      });

      stream.on('end', () => {
        const file = Buffer.concat(dataArray);
        resolve(
          `data:${fileInfos.contentType};base64,${file.toString('base64')}`,
        );
      });

      stream.on('error', error => {
        reject(error);
      });

      stream.read();
    });

    return fileFromGridFS;
  }

  /**
   * Get a file GridFS with its id and return it as dataUri
   * @param {string} filename The name of the file in GridFS
   */
  async deleteFile(filename: string) {
    const filesInfos = await this.gridFSBucket.find({ filename }).toArray();

    if (filesInfos.length !== 1) {
      return undefined;
    }

    const fileInfos = filesInfos[0];

    const deletePromise = new Promise((resolve, reject) => {
      this.gridFSBucket.delete(fileInfos._id, err => {
        if (err) {
          return reject(err);
        }

        return resolve(fileInfos);
      });
    });

    return deletePromise;
  }

  /**
   * Permet de créer une entité FileStorage à partir d'un text dataURI(base64)
   * @param {string} file - la chaine de texte contenant le base64 de l'image
   * @param {string=} filename - le nom à donner au fichier (Optionnel)
   */
  static fromBase64(file: string, filename?: string): FileStorage {
    const [meta, data] = file.split(',');
    const extract = meta.match(/:(.*?);/);
    if (!extract || !(Array.isArray(extract) && extract[1])) {
      throw new Error('dataURI miss format or void');
    }
    const [, mime] = extract; // "extract" is like "image/png"
    const regext = /^image\/([a-z]{3,4})/; // extract extension name from mime type
    const [, extension] = mime.match(regext) || [];
    if (!extension) {
      throw new Error('wrong format of file in dataURI');
    }

    const buffer = Buffer.from(data, 'base64');

    const logoFile = new FileStorage();
    logoFile.originalname = `${filename || uuid()}${
      extension ? '.' + extension : ''
    }`;
    logoFile.mimetype = mime;
    logoFile.size = buffer.length;
    logoFile.buffer = buffer;
    logoFile.encoding = 'buffer';
    return logoFile;
  }
}
