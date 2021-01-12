import { Test, TestingModule } from '@nestjs/testing';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { IdentityProviderMetadata } from '@fc/oidc-client';
import { IdentityProviderEnvService } from './identity-provider-env.service';

describe('IdentityProviderEnvService', () => {
  let service: IdentityProviderEnvService;

  const validIdentityProviderMock = {
    uid: 'envIssuer',
    name: 'envIssuer',
    title: 'envIssuer Title',
    active: true,
    display: true,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: 'client_id',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    discoveryUrl:
      'https://corev2.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: 'ES256',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    post_logout_redirect_uris: [
      'https://fsp1v2.docker.dev-franceconnect.fr/logout-callback',
    ],
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: [
      'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
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
    userinfo_signed_response_alg: 'ES256',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/jwks_uri',
  };

  const env = {
    provider: {
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'client_id',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      discoveryUrl:
        'https://corev2.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      id_token_signed_response_alg: 'ES256',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      post_logout_redirect_uris: [
        'https://fsp1v2.docker.dev-franceconnect.fr/logout-callback',
      ],
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uris: [
        'https://fsp1v2.docker.dev-franceconnect.fr/login-callback',
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
      userinfo_signed_response_alg: 'ES256',
      // oidc param name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      jwks_uri: 'https://fsp1v2.docker.dev-franceconnect.fr/jwks_uri',
    },
  };

  const identityProviderListMock = [validIdentityProviderMock];

  const loggerMock = {
    setContext: jest.fn(),
    warn: jest.fn(),
  };

  const cryptographyMock = {
    decryptClientSecret: jest.fn(),
  };

  const configMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        IdentityProviderEnvService,
        LoggerService,
        ConfigService,
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(ConfigService)
      .useValue(configMock)
      .compile();

    service = module.get<IdentityProviderEnvService>(
      IdentityProviderEnvService,
    );

    configMock.get.mockReturnValue({
      discoveryUrl: 'discoveryUrl',
      provider: 'provider',
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return identity provider with change legacy property name by openid property name', () => {
      // setup
      const expected = {
        ...validIdentityProviderMock,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_secret: 'client_secret',
      };

      // action
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected.client_secret,
      );
      const result = service['legacyToOpenIdPropertyName'](
        validIdentityProviderMock,
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

    it('should return result of type list', async () => {
      // setup
      configMock.get.mockReturnValueOnce(env);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual(identityProviderListMock);
    });

    it('should log a warning if an entry is not validated by the DTO', async () => {
      // setup
      const invalidEnvMock = {
        ...env.provider,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        jwks_uri: 'not an url',
      };
      configMock.get.mockReturnValueOnce(invalidEnvMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });

    it('should log a warning if an entry is exluded by the DTO', async () => {
      // setup
      const invalidEnvMock = {
        ...env.provider,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        not_validated: 'by DTO',
      };
      configMock.get.mockReturnValueOnce(invalidEnvMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('getList', () => {
    it('should resolve', async () => {
      // action
      const result = service.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return a list of valids identity providers', async () => {
      // setup
      configMock.get.mockReturnValueOnce(env);

      // setup
      const expected = [
        {
          ...validIdentityProviderMock,
          // oidc param name
          // eslint-disable-next-line @typescript-eslint/naming-convention
          client_secret: 'client_secret',
        },
      ];

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
      service['identityProviderCache'] = [
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
      expect(result).toBe(service['identityProviderCache']);
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
