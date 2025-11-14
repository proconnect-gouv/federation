import { Repository } from 'typeorm';
import { ObjectId } from 'mongodb';

import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { LoggerService } from '../logger/logger.service';

import { SecretManagerService } from '../utils/secret-manager.service';
import { SecretAdapter } from '../utils/secret.adapter';

import { ServiceProviderService } from './service-provider.service';
import { ServiceProviderFromDb } from './service-provider.mongodb.entity';
import { ICrudTrack } from '../interfaces';
import { PaginationService } from '../pagination';
import { serviceProviderFactory } from './fixtures';
import { GristPublisherService } from '../grist-publisher/grist-publisher.service';

describe('ServiceProviderService', () => {
  let module: TestingModule;
  let serviceProviderService: ServiceProviderService;

  const secretManagerMocked = {
    encrypt: jest.fn(),
    decrypt: jest.fn(),
    generateSHA256: jest.fn(),
  };

  const secretAdapterMock = {
    generateSecret: jest.fn(),
    generateKey: jest.fn(),
  };

  const serviceProviderRepository = {
    save: jest.fn(),
    insert: jest.fn(),
    find: jest.fn(),
    findAndCount: jest.fn(),
    findOneByOrFail: jest.fn(),
    delete: jest.fn(),
  };

  const userMock = 'userMockValue';

  const insertResultMock = {
    identifiers: [{ id: 'insertedIdMock' }],
  };

  const loggerMock = {
    businessEvent: jest.fn(),
  };

  const gristPublisherServiceMock = {
    publishServiceProviders: jest.fn(),
    publishIdentityProviders: jest.fn(),
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    module = await Test.createTestingModule({
      imports: [TypeOrmModule.forFeature([ServiceProviderFromDb], 'fc-mongo')],
      providers: [
        ServiceProviderService,
        Repository,
        SecretManagerService,
        SecretAdapter,
        LoggerService,
        PaginationService,
        GristPublisherService,
      ],
    })
      .overrideProvider(getRepositoryToken(ServiceProviderFromDb, 'fc-mongo'))
      .useValue(serviceProviderRepository)
      .overrideProvider(SecretManagerService)
      .useValue(secretManagerMocked)
      .overrideProvider(SecretAdapter)
      .useValue(secretAdapterMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(GristPublisherService)
      .useValue(gristPublisherServiceMock)
      .compile();

    serviceProviderService = await module.get<ServiceProviderService>(
      ServiceProviderService,
    );

    serviceProviderRepository.insert.mockResolvedValue(insertResultMock);
  });

  afterAll(async () => {
    module.close();
  });

  describe('track', () => {
    it('should call logger.businessEvent', () => {
      // Given
      const logMock = {} as ICrudTrack;
      // When
      // tslint:disable-next-line:no-string-literal
      serviceProviderService['track'](logMock);
      // Then
      expect(loggerMock.businessEvent).toHaveBeenCalledTimes(1);
      expect(loggerMock.businessEvent).toHaveBeenCalledWith(logMock);
    });
  });

  describe('createServiceProvider', () => {
    const serviceProviderDto = serviceProviderFactory.createServiceProviderDto(
      {},
    );
    const serviceProviderFromDb =
      serviceProviderFactory.createServiceProviderFromDb({});

    const expectedServiceProviderCreated =
      serviceProviderFactory.createServiceProviderFromDb({
        client_secret: 'FE1CE803iuyiuyiy',
        IPServerAddressesAndRanges: ['192.0.0.0'],
        key: 'secretKeyMocked',
      });
    beforeEach(() => {
      serviceProviderService['track'] = jest.fn();
      secretAdapterMock.generateKey.mockReturnValue('secretKeyMocked');
      secretAdapterMock.generateSecret.mockReturnValueOnce('FE1CE803');
      secretManagerMocked.encrypt.mockReturnValueOnce('FE1CE803iuyiuyiy');
      serviceProviderRepository.findOneByOrFail.mockResolvedValue(
        serviceProviderFromDb,
      );
    });

    it('should call the tracking method', async () => {
      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderDto,
        userMock,
      );

      // Then
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledWith({
        entity: 'service-provider',
        action: 'create',
        user: userMock,
        id: 'insertedIdMock',
        name: 'secretKeyMocked',
      });
    });

    it('should call generateSecret method', async () => {
      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderDto,
        'user',
      );

      // Then
      expect(secretAdapterMock.generateSecret).toHaveBeenCalledTimes(1);
    });

    it('should call encrypt method', async () => {
      // When
      const _result = await serviceProviderService.createServiceProvider(
        serviceProviderDto,
        'user',
      );

      // Then
      expect(secretManagerMocked.encrypt).toHaveBeenCalledTimes(1);
      expect(secretManagerMocked.encrypt).toHaveBeenCalledWith('FE1CE803');
    });

    it('should call transformDtoIntoEntity method', async () => {
      // Given
      serviceProviderService['transformDtoIntoEntity'] = jest
        .fn()
        .mockReturnValue({});

      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderDto,
        'user',
      );

      // Then
      expect(
        serviceProviderService['transformDtoIntoEntity'],
      ).toHaveBeenCalledTimes(1);
      expect(
        serviceProviderService['transformDtoIntoEntity'],
      ).toHaveBeenCalledWith(serviceProviderDto, 'user');
    });

    it('should call insert method', async () => {
      // Given
      serviceProviderService['transformDtoIntoEntity'] = jest
        .fn()
        .mockReturnValue(expectedServiceProviderCreated);

      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderDto,
        'user',
      );

      // Then
      expect(serviceProviderRepository.insert).toHaveBeenCalledTimes(1);
      expect(serviceProviderRepository.insert).toHaveBeenCalledWith(
        expectedServiceProviderCreated,
      );
    });
  });

  describe('findById', () => {
    it("should find a service provider in mongodb and decrypt it's secret", async () => {
      // setup
      const id = '5d4d6d29bbdfbd203da312f2';
      const secretCipher = '<cipher>';
      const secret = '◬ La terre est plate ◬';
      const serviceProvider = {
        id: '5d4d6d29bbdfbd203da312f2',
        client_secret: secretCipher,
      };
      serviceProviderRepository.findOneByOrFail.mockResolvedValueOnce(
        serviceProvider,
      );
      secretManagerMocked.decrypt.mockReturnValueOnce(secret);

      // action
      const result = await serviceProviderService.findById(id);

      // expect
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledTimes(
        1,
      );
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledWith({
        _id: new ObjectId(id),
      });
      expect(secretManagerMocked.decrypt).toHaveBeenCalledTimes(1);
      expect(secretManagerMocked.decrypt).toHaveBeenCalledWith(secretCipher);
      expect(result.client_secret).toEqual(secret);
    });
  });

  describe('update()', () => {
    const serviceProviderDto = serviceProviderFactory.createServiceProviderDto({
      id_token_signed_response_alg: 'id_token_signed_response_alg',
      userinfo_signed_response_alg: 'userinfo_signed_response_alg',
      scopes: ['openid'],
    });
    const existingServiceProviderFromDb =
      serviceProviderFactory.createServiceProviderFromDb({
        key: 'secretKeyMocked',
      });

    const id = '5d4d6d29bbdfbd203da312f2';

    beforeEach(() => {
      serviceProviderService['track'] = jest.fn();
      serviceProviderRepository.findOneByOrFail.mockResolvedValue(
        existingServiceProviderFromDb,
      );
    });

    it('should call findOneByOrFail method to retrieve service provider', async () => {
      // action
      await serviceProviderService.update(id, serviceProviderDto, userMock);

      // expect
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledTimes(
        1,
      );
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledWith({
        _id: new ObjectId(id),
      });
    });

    it('should calls the tracking method', async () => {
      // action
      await serviceProviderService.update(id, serviceProviderDto, userMock);
      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledWith({
        entity: 'service-provider',
        action: 'update',
        id,
        user: userMock,
        name: 'secretKeyMocked',
      });
    });

    it('should update service provider', async () => {
      const expected = {
        ...existingServiceProviderFromDb,
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        updatedAt: expect.any(Date),
      };

      // When
      await serviceProviderService.update(id, serviceProviderDto, userMock);

      // Then
      expect(serviceProviderRepository.save).toHaveBeenCalledTimes(1);
      expect(serviceProviderRepository.save).toHaveBeenCalledWith(expected);
    });
  });

  describe('delete service provider by id', () => {
    const existingServiceProviderFromDb =
      serviceProviderFactory.createServiceProviderFromDb({
        key: 'secretKeyMocked',
      });
    beforeEach(() => {
      serviceProviderRepository.delete.mockResolvedValue({ affected: 1 });
      serviceProviderRepository.findOneByOrFail.mockResolvedValue(
        existingServiceProviderFromDb,
      );
      // tslint:disable-next-line:no-string-literal
      serviceProviderService['track'] = jest.fn();
    });

    it('calls the delete function of the serviceProviderRepository with a string as argument', async () => {
      // set up
      const idMock = '5d4d6d29bbdfbd203da312f2';
      // action
      await serviceProviderService.deleteServiceProviderById(idMock, userMock);
      // assertion
      expect(serviceProviderRepository.delete).toHaveBeenCalledTimes(1);
      expect(serviceProviderRepository.delete).toHaveBeenCalledWith({
        _id: new ObjectId(idMock),
      });
    });

    it('should call the tracking method', async () => {
      // set up
      const idMock = '5d4d6d29bbdfbd203da312f2';

      // action
      await serviceProviderService.deleteServiceProviderById(idMock, userMock);
      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledWith({
        action: 'delete',
        entity: 'service-provider',
        id: idMock,
        user: userMock,
        name: 'secretKeyMocked',
      });
    });
  });

  describe('deleteManyServiceProvidersById', () => {
    it('calls the delete function of the serviceProviderRepository with an array of string as argument', async () => {
      // set up
      const clientsId = ['aaaa', 'bbbb', 'cccc'];
      serviceProviderService.deleteServiceProviderById = jest.fn();
      // action
      await serviceProviderService.deleteManyServiceProvidersById(
        clientsId,
        userMock,
      );
      // assertion
      expect(
        serviceProviderService.deleteServiceProviderById,
      ).toHaveBeenCalledTimes(3);
      expect(
        serviceProviderService.deleteServiceProviderById,
      ).toHaveBeenNthCalledWith(1, clientsId[0], userMock);
      expect(
        serviceProviderService.deleteServiceProviderById,
      ).toHaveBeenNthCalledWith(2, clientsId[1], userMock);
      expect(
        serviceProviderService.deleteServiceProviderById,
      ).toHaveBeenNthCalledWith(3, clientsId[2], userMock);
    });
  });

  describe('generate a new client secret', () => {
    it('should generate a new client secret', async () => {
      const id = '5d4d6d29bbdfbd203da312f2';

      serviceProviderRepository.findOneByOrFail.mockImplementationOnce(() =>
        Promise.resolve({
          name: 'proConnect',
          redirectUri: ['https://proConnect.com'],
          redirectUriLogout: ['https://proConnect.com/logout'],
          ipAddresses: ['192.0.0.0'],
          emails: ['v@b2.com'],
          active: true,
          type: 'private',
          key: 'bafe2428-3ab9-4c44-9021-46bde0cd13c5',
          client_secret:
            '$2b$10$EO3FnI3YKfnnvUlvr084wegEgEPeRPRMdE2VJwMHpAsNkaMv1n9pG',
        }),
      );

      secretManagerMocked.encrypt.mockReturnValueOnce(
        '$2b$10$EO3FnI3YKfnnvUlvr084wegEgEPeRPRMdE2VJwMHpAsNkaMv1n9pG',
      );

      await serviceProviderService.generateNewSecret(id, 'user');

      expect(secretAdapterMock.generateSecret).toHaveBeenCalledTimes(1);
      expect(secretManagerMocked.encrypt).toHaveBeenCalledTimes(1);
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledTimes(
        1,
      );
      expect(serviceProviderRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
