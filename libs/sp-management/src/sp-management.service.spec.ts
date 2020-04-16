/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { SpManagementService } from './sp-management.service';
import { CryptographyService } from '@fc/cryptography';

describe('SpManagementService', () => {
  let spManagementservice: SpManagementService;
  const mockCryptographyService = {
    decryptSecretHash: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
  };

  const mockExec = jest.fn();

  const serviceProviderModel = getModelToken('SpManagement');

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        SpManagementService,
        {
          provide: serviceProviderModel,
          useValue: mockRepository,
        },
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(mockCryptographyService)
      .compile();

    spManagementservice = module.get<SpManagementService>(SpManagementService);

    mockExec.mockReturnValueOnce([
      {
        _doc: {
          key: '123',
          secret_hash: 'secret hash',
          redirect_uris: ['redirect_uris'],
          id_token_signed_response_alg: 'HS256',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
          jwks_uri: 'https://sp-site.fr/jwks-uri',
        },
      },
    ]);
    mockRepository.find.mockReturnValueOnce({ exec: mockExec });
  });

  it('should be defined', () => {
    expect(spManagementservice).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const serviceProviderMock = {
        key: '123',
        secret_hash: 'secret_hash',
        redirect_uris: ['redirect_uris'],
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        id_token_encrypted_response_alg: 'id_token_encrypted_response_alg',
        id_token_encrypted_response_enc: 'id_token_encrypted_response_enc',
        userinfo_encrypted_response_alg: 'userinfo_encrypted_response_alg',
        userinfo_encrypted_response_enc: 'userinfo_encrypted_response_enc',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        jwks_uri: 'https://sp-site.fr/jwks-uri',
      };

      // action
      mockCryptographyService.decryptSecretHash.mockReturnValueOnce(
        'client_secret',
      );
      const result = spManagementservice['legacyToOpenIdPropertyName'](
        serviceProviderMock,
      );

      // expect
      expect(result).toStrictEqual({
        client_id: '123',
        client_secret: 'client_secret',
        redirect_uris: ['redirect_uris'],
        id_token_signed_response_alg: 'id_token_signed_response_alg',
        id_token_encrypted_response_alg: 'id_token_encrypted_response_alg',
        id_token_encrypted_response_enc: 'id_token_encrypted_response_enc',
        userinfo_encrypted_response_alg: 'userinfo_encrypted_response_alg',
        userinfo_encrypted_response_enc: 'userinfo_encrypted_response_enc',
        userinfo_signed_response_alg: 'userinfo_signed_response_alg',
        jwks_uri: 'https://sp-site.fr/jwks-uri',
      });
    });
  });

  describe('findAllServiceProvider', () => {
    it('should resolve', async () => {
      // action
      const result = spManagementservice['findAllServiceProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // action
      await spManagementservice['findAllServiceProvider']();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await spManagementservice['findAllServiceProvider']();

      // expect
      expect(result).toStrictEqual([
        {
          key: '123',
          secret_hash: 'secret hash',
          redirect_uris: ['redirect_uris'],
          id_token_signed_response_alg: 'HS256',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
          jwks_uri: 'https://sp-site.fr/jwks-uri',
        },
      ]);
    });
  });

  describe('getList', () => {
    it('should resolve', async () => {
      // action
      const result = spManagementservice.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return result of type list', async () => {
      // action
      mockCryptographyService.decryptSecretHash.mockReturnValueOnce(
        'client_secret',
      );
      const result = await spManagementservice.getList();

      // expect
      expect(result).toStrictEqual([
        {
          client_id: '123',
          client_secret: 'client_secret',
          redirect_uris: ['redirect_uris'],
          id_token_signed_response_alg: 'HS256',
          id_token_encrypted_response_alg: 'RSA-OAEP',
          id_token_encrypted_response_enc: 'A256GCM',
          userinfo_encrypted_response_alg: 'RSA-OAEP',
          userinfo_encrypted_response_enc: 'A256GCM',
          userinfo_signed_response_alg: 'HS256',
          jwks_uri: 'https://sp-site.fr/jwks-uri',
        },
      ]);
    });
  });
});
