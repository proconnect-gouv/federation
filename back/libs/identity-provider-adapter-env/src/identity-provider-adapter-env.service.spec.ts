import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';

import { getLoggerMock } from '@mocks/logger';

import { IdentityProviderAdapter } from './dto';
import { IdentityProviderAdapterEnvService } from './identity-provider-adapter-env.service';

describe('IdentityProviderAdapterEnvService', () => {
  let service: IdentityProviderAdapterEnvService;

  const idpConfiguration: IdentityProviderAdapter = {
    uid: 'thisIsUid',
    name: 'idp-mock',
    title: 'IdP Mock',
    active: true,
    display: true,
    discovery: true,
    discoveryUrl:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
    clientSecretEncryptKey: 'clientSecretEncryptKey',
    client: {
      client_id: 'client_id',
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      id_token_signed_response_alg: 'ES256',
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      revocation_endpoint_auth_method: 'client_secret_post',
      id_token_encrypted_response_alg: 'RSA-OAEP',
      id_token_encrypted_response_enc: 'A256GCM',
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      userinfo_encrypted_response_enc: 'A256GCM',
      userinfo_signed_response_alg: 'ES256',
    },
    issuer: {
      jwks_uri: 'https://fsp1-high.docker.dev-franceconnect.fr/jwks_uri',
      end_session_endpoint: 'https://end-session-endpoint.mock',
    },
  };

  const env = {
    list: [idpConfiguration],
  };

  const validIdentityProviderMock = {
    uid: 'thisIsUid',
    name: 'idp-mock',
    title: 'IdP Mock',
    active: true,
    display: true,
    discovery: true,
    discoveryUrl:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
    client: {
      client_id: 'client_id',
      client_secret: 'totoIsDecrypted',
      id_token_signed_response_alg: 'ES256',
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      revocation_endpoint_auth_method: 'client_secret_post',
      id_token_encrypted_response_alg: 'RSA-OAEP',
      id_token_encrypted_response_enc: 'A256GCM',
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      userinfo_encrypted_response_enc: 'A256GCM',
      userinfo_signed_response_alg: 'ES256',
    },
    issuer: {
      jwks_uri: 'https://fsp1-high.docker.dev-franceconnect.fr/jwks_uri',
      end_session_endpoint: 'https://end-session-endpoint.mock',
    },
  };

  const toPanvaFormatMock = {
    uid: idpConfiguration.uid,
    title: idpConfiguration.title,
    name: idpConfiguration.name,
    display: true,
    active: true,
    discovery: true,
    discoveryUrl:
      'https://core-fcp-high.docker.dev-franceconnect.fr/api/v2/.well-known/openid-configuration',
    issuer: {
      jwks_uri: 'https://fsp1-high.docker.dev-franceconnect.fr/jwks_uri',
      end_session_endpoint: 'https://end-session-endpoint.mock',
    },
    client: {
      client_id: 'client_id',
      client_secret: '7vhnwzo1yUVOJT9GJ91gD5oid56effu1',
      id_token_signed_response_alg: 'ES256',
      response_types: ['code'],
      token_endpoint_auth_method: 'client_secret_post',
      revocation_endpoint_auth_method: 'client_secret_post',
      id_token_encrypted_response_alg: 'RSA-OAEP',
      id_token_encrypted_response_enc: 'A256GCM',
      userinfo_encrypted_response_alg: 'RSA-OAEP',
      userinfo_encrypted_response_enc: 'A256GCM',
      userinfo_signed_response_alg: 'ES256',
    },
  };

  const loggerMock = getLoggerMock();

  const cryptographyMock = {
    decrypt: jest.fn(),
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
        IdentityProviderAdapterEnvService,
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

    service = module.get<IdentityProviderAdapterEnvService>(
      IdentityProviderAdapterEnvService,
    );

    configMock.get.mockReturnValue(env);

    cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return identity provider with change legacy property name by openid property name', () => {
      // setup
      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(toPanvaFormatMock.client.client_secret);

      // action
      const result = service['legacyToOpenIdPropertyName'](idpConfiguration);

      // expect
      expect(result).toEqual(toPanvaFormatMock);
    });
  });

  describe('findAllIdentityProvider', () => {
    it('should return result of type list', async () => {
      // setup
      configMock.get.mockReturnValueOnce(env);

      // action
      const result = await service['findAllIdentityProvider']();

      // expect
      expect(result).toEqual([idpConfiguration]);
    });

    it('should log a warning if an entry is not validated by the DTO', async () => {
      // setup
      const invalidEnvMock = {
        list: [
          {
            ...idpConfiguration,
            active: 'not a boolean',
          },
        ],
      };
      configMock.get.mockReturnValueOnce(invalidEnvMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.warning).toHaveBeenCalledTimes(1);
    });

    it('should log a warning if an entry is exluded by the DTO', async () => {
      // setup
      const invalidEnvMock = {
        list: [
          {
            ...idpConfiguration,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            not_validated: 'by DTO',
          },
        ],
      };
      configMock.get.mockReturnValueOnce(invalidEnvMock);

      // action
      await service['findAllIdentityProvider']();

      // expect
      expect(loggerMock.warning).toHaveBeenCalledTimes(1);
    });
  });

  describe('getList', () => {
    it('should return a list of valids identity providers', async () => {
      // setup
      configMock.get.mockReturnValueOnce(env);
      const expected = toPanvaFormatMock;

      service['decryptClientSecret'] = jest
        .fn()
        .mockReturnValueOnce(expected.client.client_secret);

      // action
      const result = await service.getList();

      // expect
      expect(result).toEqual([expected]);
    });

    it('should call findAll method if refreshCache is true', async () => {
      // Given
      const refresh = true;
      const listMock = [
        {
          client: {
            client_id: 'foo',
            client_secret: 'totoIsDecrypted',
          },
        },
        {
          client: {
            client_id: 'bar',
            client_secret: 'totoIsDecrypted',
          },
        },
      ];
      service['findAllIdentityProvider'] = jest
        .fn()
        .mockResolvedValue(listMock);
      // When
      const result = await service.getList(refresh);
      // Then
      expect(service['findAllIdentityProvider']).toHaveBeenCalledTimes(1);
      expect(service['findAllIdentityProvider']).toHaveBeenCalledWith();
      expect(result).toEqual(listMock);
    });

    it('should not call findAll method if refreshCache is not set and cache exists', async () => {
      // Given
      service['identityProviderCache'] = [
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
      expect(result).toBe(service['identityProviderCache']);
      expect(service['findAllIdentityProvider']).toHaveBeenCalledTimes(0);
    });
  });

  describe('refreshCache', () => {
    beforeEach(() => {
      // Given
      service.getList = jest.fn();
    });
    it('should call getList method with true value in param', async () => {
      // When
      await service.refreshCache();
      // Then
      expect(service.getList).toHaveBeenCalledTimes(1);
      expect(service.getList).toHaveBeenCalledWith(true);
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
    it('should call decrypt with enc key from config', () => {
      // Given
      const clientSecretMock = 'some string';
      const clientSecretEncryptKey = 'Key';
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');
      // When
      service['decryptClientSecret'](clientSecretMock, clientSecretEncryptKey);
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
      cryptographyMock.decrypt.mockReturnValue('totoIsDecrypted');

      // When
      const result = service['decryptClientSecret'](
        clientSecretMock,
        clientSecretEncryptKey,
      );
      // Then
      expect(result).toEqual('totoIsDecrypted');
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
