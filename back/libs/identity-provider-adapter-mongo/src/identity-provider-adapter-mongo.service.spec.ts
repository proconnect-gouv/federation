import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { EventBus } from '@nestjs/cqrs';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { MongooseCollectionOperationWatcherHelper } from '@fc/mongoose';
import { IdentityProviderMetadata } from '@fc/oidc';

import { getLoggerMock } from '@mocks/logger';

import {
  DiscoveryIdpAdapterMongoDTO,
  NoDiscoveryIdpAdapterMongoDTO,
} from './dto';
import { IdentityProviderAdapterMongoService } from './identity-provider-adapter-mongo.service';
import { IdentityProvider } from './schemas';

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

jest.mock('class-transformer', () => ({
  ...jest.requireActual('class-transformer'),
  plainToInstance: jest.fn(),
}));

describe('IdentityProviderAdapterMongoService', () => {
  let service: IdentityProviderAdapterMongoService;

  const legacyIdentityProviderMock = {
    active: true,
    authzURL:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/authorize',
    clientID: 'clientID',
    client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
    discovery: false,
    endSessionURL:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/session/end',
    id_token_encrypted_response_alg: 'RSA-OAEP',
    id_token_encrypted_response_enc: 'A256GCM',
    id_token_signed_response_alg: 'HS256',
    jwksURL: 'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/certs',
    name: 'provider1',
    title: 'provider 1',
    tokenURL: 'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/token',
    token_endpoint_auth_method: 'client_secret_post',
    uid: 'uid',
    url: 'https://core-fcp-high.docker.dev-franceconnect.fr',
    userInfoURL:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/userinfo',
    userinfo_encrypted_response_alg: 'RSA-OAEP',
    userinfo_encrypted_response_enc: 'A256GCM',
    userinfo_signed_response_alg: 'HS256',
  };

  const legacyToOpenIdPropertyNameOutputMock = {
    active: true,
    authorization_endpoint:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/authorize',
    client_id: 'clientID',
    client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
    discovery: false,
    end_session_endpoint:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/session/end',
    id_token_encrypted_response_alg: 'RSA-OAEP',
    id_token_encrypted_response_enc: 'A256GCM',
    id_token_signed_response_alg: 'HS256',
    issuer: 'https://core-fcp-high.docker.dev-franceconnect.fr',
    jwks_uri: 'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/certs',
    name: 'provider1',
    response_types: ['code'],
    revocation_endpoint_auth_method: 'client_secret_post',
    title: 'provider 1',
    token_endpoint:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/token',
    token_endpoint_auth_method: 'client_secret_post',
    uid: 'uid',
    userinfo_encrypted_response_alg: 'RSA-OAEP',
    userinfo_encrypted_response_enc: 'A256GCM',
    userinfo_endpoint:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/userinfo',
    userinfo_signed_response_alg: 'HS256',
  };

  const validIdentityProviderMock = {
    active: true,
    client: {
      client_id: 'clientID',
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      id_token_encrypted_response_alg: 'RSA-OAEP',
      id_token_encrypted_response_enc: 'A256GCM',
      id_token_signed_response_alg: 'HS256',
      response_types: ['code'],
      revocation_endpoint_auth_method: 'client_secret_post',
      token_endpoint_auth_method: 'client_secret_post',
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      userinfo_encrypted_response_enc: 'A256GCM',
      userinfo_signed_response_alg: 'HS256',
    },
    discovery: false,
    issuer: {
      authorization_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/authorize',
      end_session_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/session/end',
      issuer: 'https://core-fcp-high.docker.dev-franceconnect.fr',
      jwks_uri:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/certs',
      token_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/token',
      userinfo_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/userinfo',
    },
    name: 'provider1',
    title: 'provider 1',
    uid: 'uid',
  };

  const invalidIdentityProviderMock = {
    ...legacyIdentityProviderMock,
    active: 'NOT_A_BOOLEAN',
  };

  const identityProviderListMock = [legacyIdentityProviderMock];

  const loggerMock = getLoggerMock();

  const cryptographyMock = {
    decrypt: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  const repositoryMock = {
    lean: jest.fn(),
    find: jest.fn(),
    sort: jest.fn(),
    watch: jest.fn(),
  };

  const eventBusMock = {
    publish: jest.fn(),
  };

  const mongooseCollectionOperationWatcherHelperMock = {
    connectAllWatchers: jest.fn(),
    watchWith: jest.fn(),
    watch: jest.fn(),
    operationTypeWatcher: jest.fn(),
  };

  const identityProviderModel = getModelToken('IdentityProvider');

  const validateMock = jest.mocked(validate);
  const plainToInstanceMock = jest.mocked(plainToInstance);

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        IdentityProviderAdapterMongoService,
        {
          provide: identityProviderModel,
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

    service = module.get<IdentityProviderAdapterMongoService>(
      IdentityProviderAdapterMongoService,
    );

    repositoryMock.lean.mockResolvedValueOnce(identityProviderListMock);
    repositoryMock.find.mockReturnValueOnce(repositoryMock);
    repositoryMock.sort.mockReturnValueOnce(repositoryMock);
    plainToInstanceMock.mockImplementation((_dto, obj) => obj);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    beforeEach(() => {
      // Given
      service['getList'] = jest.fn();
    });

    it('should call getList', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(service['getList']).toHaveBeenCalledTimes(1);
      expect(service['getList']).toHaveBeenCalledWith();
    });

    it('should call watchWith from mongooseHelper', async () => {
      // When
      await service.onModuleInit();
      // Then
      expect(
        mongooseCollectionOperationWatcherHelperMock.watchWith,
      ).toHaveBeenCalledTimes(1);
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

  describe('getIdpsByFqdn', () => {
    const idpListMock = [
      { id: '1', fqdns: ['default-fqdn.fr'] },
      { id: '2', fqdns: ['abc.fr'] },
      { id: '3', fqdns: ['foo.fr', 'default-fqdn.fr'] },
    ];
    beforeEach(() => {
      service.getList = jest.fn().mockResolvedValueOnce(idpListMock);
    });

    it('should return a list of FqdnToIdentityProvider', async () => {
      const idpsByFqdn = await service.getIdpsByFqdn('default-fqdn.fr');
      expect(idpsByFqdn).toStrictEqual([idpListMock[0], idpListMock[2]]);
    });

    it('should return an empty array if no corresponding FI is found for a fqdn', async () => {
      const fqdnToIdps = await service.getIdpsByFqdn('non-existing-fqdn.fr');
      expect(fqdnToIdps).toStrictEqual([]);
    });
  });

  describe('getIdpsByEmail', () => {
    beforeEach(() => {
      service.getIdpsByFqdn = jest.fn();
    });

    it('should only return the full qualified domain name from an email address', async () => {
      // When
      await service.getIdpsByEmail('hermione.granger@hogwarts.uk');

      // Then
      expect(service.getIdpsByFqdn).toHaveBeenCalledTimes(1);
      expect(service.getIdpsByFqdn).toHaveBeenCalledWith('hogwarts.uk');
    });

    it('should only return the full qualified domain name from an email address with two @', async () => {
      // When
      await service.getIdpsByEmail('hermione@grangerhogwarts@hogwarts.uk');

      // Then
      expect(service.getIdpsByFqdn).toHaveBeenCalledTimes(1);
      expect(service.getIdpsByFqdn).toHaveBeenCalledWith('hogwarts.uk');
    });
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return identity provider with change legacy property name by openid property name', () => {
      // setup
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(legacyIdentityProviderMock.client_secret);

      configMock.get.mockReturnValueOnce({
        fqdn: 'core-fcp-high.docker.dev-franceconnect.fr',
      });

      // action
      const result = service['legacyToOpenIdPropertyName'](
        legacyIdentityProviderMock as unknown as IdentityProvider,
      );

      // expect
      expect(result).toEqual(validIdentityProviderMock);
    });
  });

  describe('toPanvaFormat', () => {
    it('should return an object with data for FC and properties issuer and client for panva', () => {
      // action
      const result = service['toPanvaFormat'](
        legacyToOpenIdPropertyNameOutputMock as unknown,
      );

      // expect
      expect(result).toEqual(validIdentityProviderMock);
    });
  });

  describe('findAllIdentityProvider', () => {
    beforeEach(() => {
      configMock.get.mockReturnValueOnce({
        disableIdpValidationOnLegacy: false,
      });
    });

    it('should resolve', async () => {
      // arrange
      validateMock.mockResolvedValueOnce([]);

      // action
      const result = service['findAllIdentityProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // arrange
      validateMock.mockResolvedValueOnce([]);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should get the configuration', async () => {
      // setup
      validateMock.mockResolvedValueOnce([]);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(configMock.get).toHaveBeenCalledTimes(1);
      expect(configMock.get).toHaveBeenCalledWith(
        'IdentityProviderAdapterMongo',
      );
    });

    it('should return result of type list', async () => {
      // setup
      validateMock.mockResolvedValueOnce([]);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual([legacyIdentityProviderMock]);
    });

    it('should not call validateDto if the config "disableIdpValidationOnLegacy" is set to "true"', async () => {
      // setup
      validateMock.mockResolvedValueOnce([new ValidationError()]);
      configMock.get
        .mockReset()
        .mockReturnValueOnce({ disableIdpValidationOnLegacy: true });

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(validateMock).toHaveBeenCalledTimes(0);
    });

    it('should log an alert if an entry is excluded by the DTO', async () => {
      // setup
      const invalidIdentityProviderListMock = [
        legacyIdentityProviderMock,
        invalidIdentityProviderMock,
      ];
      validateMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([new ValidationError()]);

      repositoryMock.lean = jest
        .fn()
        .mockResolvedValueOnce(invalidIdentityProviderListMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.alert).toHaveBeenCalledTimes(1);
      expect(loggerMock.alert).toHaveBeenCalledWith({
        msg: `Identity provider "${invalidIdentityProviderMock.name}" (${invalidIdentityProviderMock.uid}) was excluded at DTO validation`,
        validationErrors: [{}],
      });
    });

    it('should filter out any entry exluded by the DTO', async () => {
      // setup
      const invalidIdentityProviderListMock = [
        legacyIdentityProviderMock,
        invalidIdentityProviderMock,
      ];
      validateMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([new ValidationError()]);

      repositoryMock.lean = jest
        .fn()
        .mockResolvedValueOnce(invalidIdentityProviderListMock);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual(identityProviderListMock);
    });
  });

  describe('getList', () => {
    beforeEach(() => {
      service['findAllIdentityProvider'] = jest
        .fn()
        .mockResolvedValueOnce(identityProviderListMock);
    });

    it('should resolve', async () => {
      // setup
      const legacyToOpenIdMock = jest.spyOn<
        IdentityProviderAdapterMongoService,
        any
      >(service, 'legacyToOpenIdPropertyName');
      legacyToOpenIdMock.mockImplementationOnce((data) => data);

      // action
      const result = service.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return a list of valides identity providers', async () => {
      // setup
      // change client_id and client_secret in validIdentityProviderMock
      const expected = [
        Object.assign(validIdentityProviderMock, {
          client: Object.assign(
            {
              client_id: 'clientID',
              client_secret: 'client_secret',
            },
            validIdentityProviderMock.client,
          ),
        }),
      ];

      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected[0].client.client_secret);

      configMock.get.mockReturnValueOnce({
        fqdn: 'core-fcp-high.docker.dev-franceconnect.fr',
      });

      // action
      const result = await service.getList();

      // expect
      expect(result).toEqual(expected);
    });

    it('should call findAll method if refreshCache is true', async () => {
      // Given
      const refresh = true;
      const listMock = [
        {
          client_id: 'foo',
        },
        {
          client_id: 'bar',
        },
      ];
      service['findAllIdentityProvider'] = jest
        .fn()
        .mockResolvedValue(listMock);
      service['legacyToOpenIdPropertyName'] = jest
        .fn()
        .mockImplementation((input) => input);
      // When
      const result = await service.getList(refresh);
      // Then
      expect(service['findAllIdentityProvider']).toHaveBeenCalledTimes(1);
      expect(service['findAllIdentityProvider']).toHaveBeenCalledWith();
      expect(service['legacyToOpenIdPropertyName']).toHaveBeenCalledTimes(
        listMock.length,
      );
      expect(result).toEqual(listMock);
    });

    it('should not call findAll method if refreshCache is not set and cache exists', async () => {
      // Given
      service['listCache'] = [
        {
          client: {
            client_id: 'foo',
          },
        } as IdentityProviderMetadata,
        {
          client: {
            client_id: 'bar',
          },
        } as IdentityProviderMetadata,
      ];
      service['findAllIdentityProvider'] = jest.fn();
      // When
      const result = await service.getList();
      // Then
      expect(result).toBe(service['listCache']);
      expect(service['findAllIdentityProvider']).toHaveBeenCalledTimes(0);
    });
  });

  describe('getById', () => {
    // Given
    const idpListMock = [{ uid: 'wizz' }, { uid: 'foo' }, { uid: 'bar' }];

    it('should return an existing IdP', async () => {
      // Given
      const idMock = 'foo';
      service.getList = jest.fn().mockResolvedValueOnce(idpListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toEqual({ uid: 'foo' });
    });

    it('should return undefined for non existing IdP', async () => {
      // Given
      const idMock = 'nope';
      service.getList = jest.fn().mockResolvedValueOnce(idpListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toBeUndefined();
    });

    it('should pass refresh flag to getList method', async () => {
      // Given
      const idMock = 'foo';
      const refresh = true;
      service.getList = jest.fn().mockResolvedValueOnce(idpListMock);
      // When
      await service.getById(idMock, refresh);
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
      expect(service.getList).toHaveBeenCalledWith(refresh);
    });
  });

  describe('decryptClientSecret', () => {
    it('should get clientSecretEncryptKey and decryptClientSecretFeature from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const decryptClientSecretFeature = false;
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValueOnce({
        clientSecretEncryptKey,
        decryptClientSecretFeature,
      });

      // When
      service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(configMock.get).toHaveBeenCalledTimes(1);
    });

    it('should return null if decryptClientSecretFeature is false', () => {
      // Given
      const clientSecretMock = 'some string';
      const decryptClientSecretFeature = false;
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({
        clientSecretEncryptKey,
        decryptClientSecretFeature,
      });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');

      // When
      const result = service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(result).toEqual(null);
    });

    it('should call decrypt with enc key from config if decryptClientSecretFeature is true', () => {
      // Given
      const clientSecretMock = 'some string';
      const decryptClientSecretFeature = true;
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({
        clientSecretEncryptKey,
        decryptClientSecretFeature,
      });
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

    it('should return clientSecretEncryptKey if decryptClientSecretFeature is true', () => {
      // Given
      const clientSecretMock = 'some string';
      const decryptClientSecretFeature = true;
      const clientSecretEncryptKey = 'Key';
      configMock.get.mockReturnValue({
        clientSecretEncryptKey,
        decryptClientSecretFeature,
      });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');

      // When
      const result = service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(result).toEqual('totoIsDecrypted');
    });
  });

  describe('getIdentityProviderDTO', () => {
    it('should return discovery identity provider DTO', () => {
      // Given
      const discovery = true;

      // When
      const result = service['getIdentityProviderDTO'](discovery);
      // Then
      expect(result).toBe(DiscoveryIdpAdapterMongoDTO);
    });

    it('should return identity provider DTO', () => {
      // Given
      const discovery = false;

      // When
      const result = service['getIdentityProviderDTO'](discovery);
      // Then
      expect(result).toBe(NoDiscoveryIdpAdapterMongoDTO);
    });
  });

  describe('isActiveById()', () => {
    it('should return true if idp is active', async () => {
      // Given
      service['getById'] = jest
        .fn()
        .mockResolvedValue(validIdentityProviderMock);
      // When
      const result = await service.isActiveById('id');
      // Then
      expect(result).toBeTrue();
    });

    it('should return false if idp is disabled', async () => {
      // Given
      service['getById'] = jest
        .fn()
        .mockResolvedValue({ ...validIdentityProviderMock, active: false });
      // When
      const result = await service.isActiveById('id');
      // Then
      expect(result).toBeFalse();
    });

    it('should return false if idp is not found', async () => {
      // Given
      const { active: _active, ...idpWithoutActiveKeyMock } =
        validIdentityProviderMock;
      service['getById'] = jest.fn().mockResolvedValue(idpWithoutActiveKeyMock);
      // When
      const result = await service.isActiveById('id');
      // Then
      expect(result).toBeFalse();
    });
  });
});
