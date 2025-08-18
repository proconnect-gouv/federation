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
import { ServiceProviderDto } from './dto/service-provider-input.dto';
import { PaginationService } from '../pagination';

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

  const serviceProviderMock = {
    key: 'keyMock',
    name: 'monfs',
    redirectUri: ['https://monfs.com'],
    redirectUriLogout: ['https://monfs.com/logout'],
    site: ['https://monfs.com'],
    ipAddresses: ['192.0.0.0'],
    emails: ['v@b.com'],
    active: true,
    type: 'private',
    scopes: [],
    trustedIdentity: false,
  } as unknown as ServiceProviderDto;

  const expectedServiceProviderCreated = {
    active: true,
    name: 'monfs',
    site: ['https://monfs.com'],
    client_secret: 'FE1CE803iuyiuyiy',
    createdAt: expect.any(Date),
    emails: ['v@b.com'],
    entityId: 'secretKeyMocked',
    ipAddresses: ['192.0.0.0'],
    key: 'secretKeyMocked',
    redirectUri: ['https://monfs.com'],
    redirectUriLogout: ['https://monfs.com/logout'],
    scopes: [],
    secretCreatedAt: expect.any(Date),
    secretUpdatedAt: expect.any(Date),
    secretUpdatedBy: 'user',
    trustedIdentity: false,
    type: 'private',
    updatedAt: expect.any(Date),
    updatedBy: 'user',
  };

  const expectedServiceProviderUpdated = {
    active: true,
    name: 'monfs',
    site: ['https://monfs.com'],
    email: 'v@b.com',
    IPServerAddressesAndRanges: ['192.0.0.0'],
    redirect_uris: ['https://monfs.com'],
    post_logout_redirect_uris: ['https://monfs.com/logout'],
    scopes: ['openid'],
    type: 'private',
    updatedAt: expect.any(Date),
    updatedBy: 'userMockValue',
  };

  const insertResultMock = {
    identifiers: [{ id: 'insertedIdMock' }],
  };

  const loggerMock = {
    businessEvent: jest.fn(),
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
      .compile();

    serviceProviderService = await module.get<ServiceProviderService>(
      ServiceProviderService,
    );

    serviceProviderRepository.findOneByOrFail.mockResolvedValue(
      serviceProviderMock,
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
    beforeEach(() => {
      // tslint:disable-next-line:no-string-literal
      serviceProviderService['track'] = jest.fn();
      secretAdapterMock.generateKey.mockReturnValue('secretKeyMocked');
      secretAdapterMock.generateSecret.mockReturnValueOnce('FE1CE803');
      secretManagerMocked.encrypt.mockReturnValueOnce('FE1CE803iuyiuyiy');
    });

    it('should call the tracking method', async () => {
      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderMock,
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

    it('should call generateKey once if entityId is provide in params', async () => {
      // Given
      const spMock = {
        ...serviceProviderMock,
        entityId: '12aze3',
      };

      // When
      const _result = await serviceProviderService.createServiceProvider(
        spMock,
        'user',
      );

      // Then
      expect(secretAdapterMock.generateKey).toHaveBeenCalledTimes(1);
    });

    it('should call generateKey twice if entityId is not provide in params', async () => {
      // When
      const _result = await serviceProviderService.createServiceProvider(
        serviceProviderMock,
        'user',
      );

      // Then
      expect(secretAdapterMock.generateKey).toHaveBeenCalledTimes(2);
    });

    it('should call generateSecret method', async () => {
      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderMock,
        'user',
      );

      // Then
      expect(secretAdapterMock.generateSecret).toHaveBeenCalledTimes(1);
    });

    it('should call encrypt method', async () => {
      // When
      const _result = await serviceProviderService.createServiceProvider(
        serviceProviderMock,
        'user',
      );

      // Then
      expect(secretManagerMocked.encrypt).toHaveBeenCalledTimes(1);
      expect(secretManagerMocked.encrypt).toHaveBeenCalledWith('FE1CE803');
    });

    // todo: remove this ref to legacy
    it('should call transformIntoLegacy method', async () => {
      // Given
      serviceProviderService['transformIntoLegacy'] = jest
        .fn()
        .mockReturnValue({});

      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderMock,
        'user',
      );

      // Then
      expect(
        serviceProviderService['transformIntoLegacy'],
      ).toHaveBeenCalledTimes(1);
      expect(
        serviceProviderService['transformIntoLegacy'],
      ).toHaveBeenCalledWith({
        key: 'keyMock',
        active: true,
        emails: ['v@b.com'],
        ipAddresses: ['192.0.0.0'],
        name: 'monfs',
        redirectUri: ['https://monfs.com'],
        redirectUriLogout: ['https://monfs.com/logout'],
        scopes: [],
        site: ['https://monfs.com'],
        trustedIdentity: false,
        type: 'private',
      });
    });

    it('should call insert method', async () => {
      // Given
      serviceProviderService['transformIntoLegacy'] = jest
        .fn()
        .mockReturnValue(serviceProviderMock);

      // When
      await serviceProviderService.createServiceProvider(
        serviceProviderMock,
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
    const id = '5d4d6d29bbdfbd203da312f2';

    beforeEach(() => {
      // tslint:disable-next-line:no-string-literal
      serviceProviderService['track'] = jest.fn();
    });

    it('should call findOneByOrFail method to retrieve service provider', async () => {
      // action
      await serviceProviderService.update(id, serviceProviderMock, userMock);

      // expect
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledTimes(
        1,
      );
      expect(serviceProviderRepository.findOneByOrFail).toHaveBeenCalledWith({
        _id: new ObjectId(id),
      });
    });

    it('should calls the tracking method', async () => {
      // setup
      serviceProviderRepository.findOneByOrFail.mockImplementationOnce(() =>
        Promise.resolve({
          name: 'franceConnect',
          redirectUri: ['https://franceConnect.com'],
          redirectUriLogout: ['https://franceConnect.com/logout'],
          site: 'https://franceConnect.com',
          ipAddresses: ['192.0.0.0'],
          emails: ['v@b2.com'],
          active: true,
          type: 'private',
          scopes: ['toto', 'tutu'],
          trustedIdentity: false,
        }),
      );

      // action
      await serviceProviderService.update(id, serviceProviderMock, userMock);
      // assertion
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledTimes(1);
      // tslint:disable-next-line:no-string-literal
      expect(serviceProviderService['track']).toHaveBeenCalledWith({
        entity: 'service-provider',
        action: 'update',
        id,
        user: userMock,
      });
    });

    it('should update service provider', async () => {
      // Given
      const dataToUpdate = {
        ...serviceProviderMock,
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
      } as unknown as ServiceProviderDto;

      serviceProviderRepository.findOneByOrFail.mockImplementationOnce(() =>
        Promise.resolve({
          name: 'proConnect',
          redirect_uris: ['https://proConnect.fr'],
          post_logout_redirect_uris: ['https://proConnect.fr/logout'],
          site: 'https://proConnect.fr',
          IPServerAddressesAndRanges: ['192.0.0.0'],
          email: ['v@b2.com'],
          active: false,
          type: 'private',
          scopes: ['toto', 'tutu'],
          id_token_signed_response_alg: 'id_token_signed_response_alg',
          userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        }),
      );

      const expected = {
        ...expectedServiceProviderUpdated,
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
      };

      // When
      await serviceProviderService.update(id, dataToUpdate, userMock);

      // Then
      expect(serviceProviderRepository.save).toHaveBeenCalledTimes(1);
      expect(serviceProviderRepository.save).toHaveBeenCalledWith(expected);
    });
  });

  describe('delete service provider by id', () => {
    beforeEach(() => {
      serviceProviderRepository.delete.mockResolvedValue({ affected: 1 });

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
        name: 'keyMock',
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
          site: 'https://proConnect.com',
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
