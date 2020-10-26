import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { EventBus } from '@nestjs/cqrs';
import { IdentityProviderService } from './identity-provider.service';

describe('IdentityProviderService', () => {
  let service: IdentityProviderService;

  const validIdentityProviderMock = {
    _doc: {
      uid: 'uid',
      name: 'provider1',
      active: true,
      display: false,
      clientID: 'clientID',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      discoveryUrl: 'https://corev2.docker.dev-franceconnect.fr/well_known_url',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_signed_response_alg: 'HS256',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      post_logout_redirect_uris: [
        'https://corev2.docker.dev-franceconnect.fr/api/v2/logout-from-provider',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: [
        'https://corev2.docker.dev-franceconnect.fr/api/v2/oidc-callback/fip1v2',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_types: ['code'],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      token_endpoint_auth_method: 'client_secret_post',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      revocation_endpoint_auth_method: 'client_secret_post',
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

  const invalidIdentityProviderMock = {
    _doc: {
      ...validIdentityProviderMock._doc,
      active: 'NOT_A_BOOLEAN',
    },
  };

  const identityProviderListMock = [validIdentityProviderMock];

  const loggerMock = {
    setContext: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  };

  const cryptographyMock = {
    decryptClientSecret: jest.fn(),
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
        IdentityProviderService,
        {
          provide: identityProviderModel,
          useValue: repositoryMock,
        },
        LoggerService,
        EventBus,
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .compile();

    service = module.get<IdentityProviderService>(IdentityProviderService);

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
      const expected = {
        ...validIdentityProviderMock._doc,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: 'clientID',
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_secret: 'client_secret',
      };
      delete expected.clientID;

      // action
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected.client_secret,
      );
      const result = service['legacyToOpenIdPropertyName'](
        validIdentityProviderMock._doc,
      );

      // expect
      expect(result).toEqual(expected);
    });
  });

  describe('findAllIdentityProvider', () => {
    it('should resolve', async () => {
      // action
      const result = service['findAllIdentityProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should have called find once', async () => {
      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual(identityProviderListMock.map(({ _doc }) => _doc));
    });

    it('should log a warning if an entry is exluded by the DTO', async () => {
      // setup
      const invalidIdentityProviderListMock = [
        validIdentityProviderMock,
        invalidIdentityProviderMock,
      ];

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
        validIdentityProviderMock,
        invalidIdentityProviderMock,
      ];

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
      // action
      const result = service.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);
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
      delete expected[0].clientID;

      // action
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected[0].client_secret,
      );
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

    it('should not call findAll method if refreshCache is not set and cache exists', async () => {
      // Given
      service['listCache'] = [
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
});
