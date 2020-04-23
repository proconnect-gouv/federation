/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { ServiceProviderService } from './service-provider.service';
import { CryptographyService } from '@fc/cryptography';

describe('ServiceProviderService', () => {
  let serviceProviderservice: ServiceProviderService;
  const mockCryptographyService = {
    decryptSecretHash: jest.fn(),
  };

  const mockRepository = {
    find: jest.fn(),
  };

  const mockExec = jest.fn();

  const serviceProviderModel = getModelToken('ServiceProvider');

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        ServiceProviderService,
        {
          provide: serviceProviderModel,
          useValue: mockRepository,
        },
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(mockCryptographyService)
      .compile();

    serviceProviderservice = module.get<ServiceProviderService>(
      ServiceProviderService,
    );

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
    expect(serviceProviderservice).toBeDefined();
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
      const result = serviceProviderservice['legacyToOpenIdPropertyName'](
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
      const result = serviceProviderservice['findAllServiceProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // action
      await serviceProviderservice['findAllServiceProvider']();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await serviceProviderservice['findAllServiceProvider']();

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
      const result = serviceProviderservice.getList();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return result of type list', async () => {
      // action
      mockCryptographyService.decryptSecretHash.mockReturnValueOnce(
        'client_secret',
      );
      const result = await serviceProviderservice.getList();

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
