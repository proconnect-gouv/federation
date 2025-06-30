import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { EventBus } from '@nestjs/cqrs';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';
import { ServiceProviderMetadata } from '@fc/oidc';

import { getLoggerMock } from '@mocks/logger';

import { ServiceProvider } from './schemas';
import { ServiceProviderAdapterMongoService } from './service-provider-adapter-mongo.service';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn(),
}));

describe('ServiceProviderAdapterMongoService', () => {
  let service: ServiceProviderAdapterMongoService;

  const validServiceProviderMock = {
    key: '987654321987654321987654321987654',
    entityId: '123456789101112131415161718192021',
    active: true,
    name: 'foo',
    title: 'title',
    client_secret: "This is an encrypted string, don't ask !",
    scopes: ['openid', 'profile'],
    redirect_uris: ['https://sp-site.fr/redirect_uris'],
    post_logout_redirect_uris: ['https://sp-site.fr/post_logout_redirect_uris'],
    id_token_signed_response_alg: 'ES256',
    userinfo_signed_response_alg: 'ES256',
    jwks_uri: 'https://sp-site.fr/jwks-uri',
    type: 'public',
  };

  const invalidServiceProviderMock = {
    ...validServiceProviderMock,
    active: 'NOT_A_BOOLEAN',
  };

  const serviceProviderListMock = [validServiceProviderMock];

  const loggerMock = getLoggerMock();

  const cryptographyMock = {
    decrypt: jest.fn(),
  };

  const repositoryMock = {
    find: jest.fn(),
    lean: jest.fn(),
    watch: jest.fn(),
  };

  const eventBusMock: object = {
    publish: jest.fn(),
  };

  const mongooseCollectionOperationWatcherHelperMock = {
    connectAllWatchers: jest.fn(),
    watchWith: jest.fn(),
  };

  const serviceProviderModel = getModelToken('ServiceProvider');

  const configMock = {
    get: jest.fn(),
  };

  const validateMock = jest.mocked(validate);
  const plainToInstanceMock = jest.mocked(plainToInstance);

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        ServiceProviderAdapterMongoService,
        {
          provide: serviceProviderModel,
          useValue: repositoryMock,
        },
        LoggerService,
        EventBus,
        ConfigService,
        MongooseCollectionOperationWatcherHelper,
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .overrideProvider(MongooseCollectionOperationWatcherHelper)
      .useValue(mongooseCollectionOperationWatcherHelperMock)
      .compile();

    service = module.get<ServiceProviderAdapterMongoService>(
      ServiceProviderAdapterMongoService,
    );

    repositoryMock.find.mockReturnValueOnce(repositoryMock);
    repositoryMock.lean.mockResolvedValueOnce(serviceProviderListMock);
    plainToInstanceMock.mockImplementation((_dto, obj) => obj);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      service.getList = jest.fn();
    });

    it('should call watchWith from mongooseHelper', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(
        mongooseCollectionOperationWatcherHelperMock.watchWith,
      ).toHaveBeenCalledTimes(1);
    });

    it('should warmup cache', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
    });
  });

  describe('refreshCache', () => {
    beforeEach(() => {
      // Given
      service.getList = jest.fn();
      configMock.get.mockReturnValueOnce({
        disableIdpValidationOnLegacy: false,
      });
    });

    it('should call getList method with true value in param', async () => {
      // When
      await service.refreshCache();
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
      expect(service.getList).toHaveBeenCalledWith(true);
    });
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const expected = {
        ...validServiceProviderMock,
        client_id: validServiceProviderMock.key,
        client_secret: 'client_secret',
        scope: validServiceProviderMock.scopes.join(' '),
      };
      delete expected.key;
      delete expected.scopes;
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected.client_secret);

      // action
      const result = service['legacyToOpenIdPropertyName'](
        validServiceProviderMock as unknown as ServiceProvider,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('findAllServiceProvider', () => {
    const expectedRetreivedFields = {
      _id: false,
      active: true,
      client_secret: true,
      entityId: true,
      grant_types: true,
      id_token_signed_response_alg: true,
      introspection_encrypted_response_alg: true,
      introspection_encrypted_response_enc: true,
      introspection_signed_response_alg: true,
      jwks_uri: true,
      key: true,
      name: true,
      post_logout_redirect_uris: true,
      redirect_uris: true,
      response_types: true,
      scopes: true,
      title: true,
      type: true,
      userinfo_signed_response_alg: true,
    };

    beforeEach(() => {
      configMock.get.mockReturnValue({
        isLocalhostAllowed: false,
      });
      validateMock.mockResolvedValueOnce([]);
    });

    it('should have called find once', async () => {
      // action
      await service['findAllServiceProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should have called find with a filter argument containing active true', async () => {
      // setup
      const expectedRequestFilter = {
        active: true,
      };
      // action
      await service['findAllServiceProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledWith(
        expectedRequestFilter,
        expectedRetreivedFields,
      );
    });

    it('should have called find with a filter argument containing active true', async () => {
      // setup
      const expectedRequestFilter = {
        active: true,
      };
      // action
      await service['findAllServiceProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledWith(
        expectedRequestFilter,
        expectedRetreivedFields,
      );
    });

    it('should return result of type list', async () => {
      // action
      const result = await service['findAllServiceProvider']();

      // expect
      expect(result).toStrictEqual(serviceProviderListMock);
    });

    it('should log a warning if an entry is excluded by the DTO', async () => {
      // setup
      validateMock.mockResolvedValueOnce([new ValidationError()]);

      const invalidServiceProviderListMock = [
        validServiceProviderMock,
        invalidServiceProviderMock,
      ];

      repositoryMock.lean = jest
        .fn()
        .mockResolvedValueOnce(invalidServiceProviderListMock);

      // action
      await service['findAllServiceProvider']();

      // expect
      expect(loggerMock.alert).toHaveBeenCalledTimes(1);
    });

    it('should filter out any entry excluded by the DTO', async () => {
      // setup
      validateMock.mockResolvedValueOnce([new ValidationError()]);

      const invalidServiceProviderListMock = [
        validServiceProviderMock,
        invalidServiceProviderMock,
      ];

      repositoryMock.lean = jest
        .fn()
        .mockResolvedValueOnce(invalidServiceProviderListMock);

      // action
      const result = await service['findAllServiceProvider']();

      // expect
      expect(result).toEqual(serviceProviderListMock);
    });
  });

  describe('getList', () => {
    beforeEach(() => {
      service['findAllServiceProvider'] = jest
        .fn()
        .mockResolvedValueOnce(serviceProviderListMock);
    });

    it('should resolve', async () => {
      // setup
      const legacyToOpenIdMock = jest.spyOn<
        ServiceProviderAdapterMongoService,
        any
      >(service, 'legacyToOpenIdPropertyName');
      legacyToOpenIdMock.mockImplementationOnce((data) => data);

      // action
      const result = service.getList(true);

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return service provider list refreshed (refresh forced)', async () => {
      const expected = [
        {
          ...validServiceProviderMock,
          client_id: '987654321987654321987654321987654',
          client_secret: 'client_secret',
          scope: 'openid profile',
        },
      ];
      delete expected[0].key;
      delete expected[0].scopes;
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected[0].client_secret);

      // action
      const result = await service.getList(true);

      // expect
      expect(service['findAllServiceProvider']).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });

    it('should return service provider list if serviceProviderListCache is not defined', async () => {
      // setup
      service['listCache'] = [
        {
          client_id: 'foo',
        },
        {
          client_id: 'bar',
        },
      ] as unknown as ServiceProviderMetadata[];
      service['findAllServiceProvider'] = jest.fn();

      // action
      const result = await service.getList();

      // expect
      expect(result).toBe(service['listCache']);
      expect(service['findAllServiceProvider']).toHaveBeenCalledTimes(0);
    });

    it('should return service provider list with the cached version', async () => {
      const expected = [
        {
          ...validServiceProviderMock,
          client_id: '987654321987654321987654321987654',
          client_secret: 'client_secret',
          scope: 'openid profile',
        },
      ];
      delete expected[0].key;
      delete expected[0].scopes;
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected[0].client_secret);

      // action
      const result = await service.getList(true);

      // expect
      expect(service['findAllServiceProvider']).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });
  });

  describe('getById', () => {
    // Given
    const spListMock = [
      {
        client_id: 'wizz',
      },
      {
        client_id: 'foo',
      },
      {
        client_id: 'bar',
      },
    ];

    it('should return an existing SP', async () => {
      // Given
      const idMock = 'foo';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toEqual({
        client_id: 'foo',
      });
    });
    it('should return undefined for non existing SP', async () => {
      // Given
      const idMock = 'nope';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toBeUndefined();
    });
    it('should pass refresh flag to getList method', async () => {
      // Given
      const idMock = 'foo';
      const refresh = true;
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      await service.getById(idMock, refresh);
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
      expect(service.getList).toHaveBeenCalledWith(refresh);
    });
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const expected = {
        ...validServiceProviderMock,
        client_id: '987654321987654321987654321987654',
        client_secret: 'client_secret',
        scope: 'openid profile',
      };
      delete expected.key;
      delete expected.scopes;
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce('client_secret');

      // action
      const result = service['legacyToOpenIdPropertyName'](
        validServiceProviderMock as unknown as ServiceProvider,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('decryptClientSecret', () => {
    it('should get clientSecretEncryptKey from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEncryptKey });

      // When
      service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(configMock.get).toHaveBeenCalledTimes(1);
    });

    it('should call decrypt with enc key from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEncryptKey });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');
      // When
      service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(cryptographyMock.decrypt).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.decrypt).toHaveBeenCalledWith(
        clientSecretEncryptKey,
        Buffer.from(clientSecretMock, 'base64'),
      );
    });

    it('should return clientSecretEncryptKey', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEncryptKey });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');

      // When
      const result = service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(result).toEqual('totoIsDecrypted');
    });
  });
});
