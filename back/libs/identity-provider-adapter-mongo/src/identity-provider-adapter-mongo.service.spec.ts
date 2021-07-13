import { mocked } from 'ts-jest/utils';
import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { getModelToken } from '@nestjs/mongoose';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc-client';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { IdentityProvider } from './schemas';
import { IdentityProviderAdapterMongoService } from './identity-provider-adapter-mongo.service';

jest.mock('@fc/common', () => ({
  ...(jest.requireActual('@fc/common') as any),
  validateDto: jest.fn(),
}));

describe('IdentityProviderAdapterMongoService', () => {
  let service: IdentityProviderAdapterMongoService;

  const legacyIdentityProviderMock = {
    _doc: {
      uid: 'uid',
      name: 'provider1',
      title: 'provider 1',
      active: true,
      display: false,
      clientID: 'clientID',
      image: 'provider1.png',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      discovery: true,
      discoveryUrl:
        'https://core-fcp-high.docker.dev-franceconnect.fr/well_known_url',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_signed_response_alg: 'HS256',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      post_logout_redirect_uris: [
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: [
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high',
      ],
      tokenURL:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/token',
      jwksURL: 'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/certs',
      authzURL:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/authorize',
      userInfoURL:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/userinfo',
      url: 'https://core-fcp-high.docker.dev-franceconnect.fr',
      endSessionURL:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/session/end',
      featureHandlers: {
        coreVerify: 'core-fcp-default-verify',
        authenticationEmail: null,
      },
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_types: ['code'],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_endpoint_auth_method: 'client_secret_post',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_encrypted_response_alg: 'RSA-OAEP',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_encrypted_response_enc: 'A256GCM',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_encrypted_response_enc: 'A256GCM',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_signed_response_alg: 'HS256',
    },
  };

  const validIdentityProviderMock = {
    _doc: {
      uid: 'uid',
      name: 'provider1',
      title: 'provider 1',
      active: true,
      display: false,
      image: 'provider1.png',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'clientID',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      issuer: 'https://core-fcp-high.docker.dev-franceconnect.fr',
      discovery: true,
      discoveryUrl:
        'https://core-fcp-high.docker.dev-franceconnect.fr/well_known_url',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_signed_response_alg: 'HS256',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      post_logout_redirect_uris: [
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: [
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1-high',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/token',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      authorization_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/authorize',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      jwks_uri:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/certs',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/userinfo',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      end_session_endpoint:
        'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/session/end',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_types: ['code'],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_endpoint_auth_method: 'client_secret_post',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_encrypted_response_alg: 'RSA-OAEP',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_encrypted_response_enc: 'A256GCM',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_encrypted_response_enc: 'A256GCM',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      userinfo_signed_response_alg: 'HS256',
      featureHandlers: {
        coreVerify: 'core-fcp-default-verify',
        authenticationEmail: null,
      },
    },
  };

  const invalidIdentityProviderMock = {
    _doc: {
      ...legacyIdentityProviderMock._doc,
      active: 'NOT_A_BOOLEAN',
    },
  };

  const identityProviderListMock = [legacyIdentityProviderMock];

  const indentityProviderMockMap = identityProviderListMock.map(
    ({ _doc }) => _doc,
  );

  const loggerMock = {
    setContext: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const cryptographyMock = {
    decrypt: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  const repositoryMock = {
    find: jest.fn(),
    exec: jest.fn(),
    watch: jest.fn(),
  };

  const eventBusMock = {
    publish: jest.fn(),
  };

  const identityProviderModel = getModelToken('IdentityProvider');

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
      .compile();

    service = module.get<IdentityProviderAdapterMongoService>(
      IdentityProviderAdapterMongoService,
    );

    repositoryMock.exec.mockResolvedValueOnce(identityProviderListMock);
    repositoryMock.find.mockReturnValueOnce(repositoryMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call initOperationTypeWatcher', () => {
      // Given
      service['initOperationTypeWatcher'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(service['initOperationTypeWatcher']).toHaveBeenCalledTimes(1);
    });
  });

  describe('initOperationTypeWatcher', () => {
    it('should call initOperationTypeWatcher', () => {
      // Given
      const streamMock = {
        driverChangeStream: { cursor: { on: jest.fn() } },
      };
      repositoryMock.watch = jest.fn().mockReturnValueOnce(streamMock);
      // When
      service['initOperationTypeWatcher']();
      // Then
      expect(repositoryMock.watch).toHaveBeenCalledTimes(1);
    });
  });

  describe('operationTypeWatcher', () => {
    // Given
    const operationTypes = {
      INSERT: 'insert',
      UPDATE: 'update',
      DELETE: 'delete',
      RENAME: 'rename',
      REPLACE: 'replace',
    };
    it('should call eventBus.publish() if DB stream.operationType = INSERT', () => {
      // Given
      const streamInsertMock = { operationType: operationTypes.INSERT };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(1);
    });
    it('should call eventBus.publish() if DB stream.operationType = UPDATE', () => {
      // Given
      const streamInsertMock = { operationType: operationTypes.UPDATE };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(1);
    });
    it('should call eventBus.publish() if DB stream.operationType = DELETE', () => {
      // Given
      const streamInsertMock = { operationType: operationTypes.DELETE };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(1);
    });
    it('should call eventBus.publish() if DB stream.operationType = RENAME', () => {
      // Given
      const streamInsertMock = { operationType: operationTypes.RENAME };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(1);
    });
    it('should call eventBus.publish() if DB stream.operationType = REPLACE', () => {
      // Given
      const streamInsertMock = { operationType: operationTypes.REPLACE };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(1);
    });
    it("shouldn't call eventBus.publish() if DB stream.operationType = null", () => {
      // Given
      const streamInsertMock = { operationType: null };
      // When
      service['operationTypeWatcher'](streamInsertMock);
      // Then
      expect(service['eventBus'].publish).toHaveBeenCalledTimes(0);
    });
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return identity provider with change legacy property name by openid property name', () => {
      // setup
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(legacyIdentityProviderMock._doc.client_secret);
      // action
      const result = service['legacyToOpenIdPropertyName'](
        legacyIdentityProviderMock._doc as unknown as IdentityProvider,
      );

      // expect
      expect(result).toEqual(validIdentityProviderMock._doc);
    });
  });

  describe('findAllIdentityProvider', () => {
    let validateDtoMock;
    beforeEach(() => {
      validateDtoMock = mocked(validateDto);
    });

    it('should resolve', async () => {
      // arrange
      validateDtoMock.mockResolvedValueOnce([]);

      // action
      const result = service['findAllIdentityProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // arrange
      validateDtoMock.mockResolvedValueOnce([]);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // setup
      validateDtoMock.mockResolvedValueOnce([]);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual([legacyIdentityProviderMock._doc]);
    });

    it('should log a warning if an entry is excluded by the DTO', async () => {
      // setup
      const invalidIdentityProviderListMock = [
        legacyIdentityProviderMock,
        invalidIdentityProviderMock,
      ];
      validateDtoMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['there is an error']);

      repositoryMock.exec = jest
        .fn()
        .mockResolvedValueOnce(invalidIdentityProviderListMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });

    it('should filter out any entry exluded by the DTO', async () => {
      // setup
      const invalidIdentityProviderListMock = [
        legacyIdentityProviderMock,
        invalidIdentityProviderMock,
      ];
      validateDtoMock
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(['there is an error']);

      repositoryMock.exec = jest
        .fn()
        .mockResolvedValueOnce(invalidIdentityProviderListMock);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual(identityProviderListMock.map(({ _doc }) => _doc));
    });
  });

  describe('getList', () => {
    beforeEach(() => {
      service['findAllIdentityProvider'] = jest
        .fn()
        .mockResolvedValueOnce(
          identityProviderListMock.map(({ _doc }) => _doc),
        );
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

    it('should return a list of valids identity providers', async () => {
      // setup
      const expected = [
        {
          ...validIdentityProviderMock._doc,
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: 'clientID',
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: 'client_secret',
        },
      ];
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected[0].client_secret);

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
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: 'foo',
        },
        {
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
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

    describe('getFilteredList', () => {
      beforeEach(() => {
        service['getList'] = jest
          .fn()
          .mockResolvedValueOnce(indentityProviderMockMap);
      });

      it('should resolve', async () => {
        // action
        const result = service.getFilteredList([], true);

        // expect
        expect(result).toBeInstanceOf(Promise);
      });

      it('should return a list of filtered whitelist identity providers', async () => {
        // setup
        const expected = [
          {
            ...legacyIdentityProviderMock._doc,
          },
        ];
        service['decryptClientSecret'] = jest
          .fn()
          .mockReturnValueOnce(expected[0].client_secret);

        // action
        const result = await service.getFilteredList(['uid'], false);

        // expect
        expect(result).toEqual(expected);
      });

      it('should return an empty list of filtered whitelist identity providers', async () => {
        // setup
        const expected = [
          {
            ...legacyIdentityProviderMock._doc,
          },
        ];
        delete expected[0].uid;

        service['decryptClientSecret'] = jest
          .fn()
          .mockReturnValueOnce(expected[0].client_secret);

        // action
        const result = await service.getFilteredList(['false_uid'], false);

        // expect
        expect(result).toEqual([]);
      });

      it('should return an empty list of filtered blacklist identity providers', async () => {
        const result = await service.getFilteredList(['uid'], true);

        // expect
        expect(result).toEqual([]);
      });

      it('should return a list of filtered blacklist identity providers', async () => {
        // setup
        const expected = [
          {
            ...legacyIdentityProviderMock._doc,
          },
        ];

        service['decryptClientSecret'] = jest
          .fn()
          .mockReturnValueOnce(expected[0].client_secret);

        // action
        const result = await service.getFilteredList(['false_uid'], true);

        // expect
        expect(result).toEqual(expected);
      });
    });

    it('should not call findAll method if refreshCache is not set and cache exists', async () => {
      // Given
      service['listCache'] = [
        {
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: 'foo',
        } as IdentityProviderMetadata,
        {
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_id: 'bar',
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
    it('should get clientSecretEcKey from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEcKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEcKey });

      // When
      service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(configMock.get).toHaveBeenCalledTimes(1);
    });

    it('should call decrypt with enc key from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEcKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEcKey });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');
      // When
      service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(cryptographyMock.decrypt).toHaveBeenCalledTimes(1);
      expect(cryptographyMock.decrypt).toHaveBeenCalledWith(
        clientSecretEcKey,
        Buffer.from(clientSecretMock, 'base64'),
      );
    });

    it('should return clientSecretEcKey', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEcKey = 'Key';
      configMock.get.mockReturnValue({ clientSecretEcKey });
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');

      // When
      const result = service['decryptClientSecret'](clientSecretMock);
      // Then
      expect(result).toEqual('totoIsDecrypted');
    });
  });
});
