/* eslint-disable @typescript-eslint/camelcase */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { ServiceProviderService } from './service-provider.service';
import { CryptographyService } from '@fc/cryptography';

describe('ServiceProviderService', () => {
  let service: ServiceProviderService;
  let rawServiceProviderFromDBMock;
  const mockCryptography = {
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
      .useValue(mockCryptography)
      .compile();

    service = module.get<ServiceProviderService>(ServiceProviderService);

    rawServiceProviderFromDBMock = [
      {
        _doc: {
          key: '123',
          active: true,
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
    ];
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const serviceProviderMock = {
        key: '123',
        active: true,
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
      mockCryptography.decryptSecretHash.mockReturnValueOnce('client_secret');
      const result = service['legacyToOpenIdPropertyName'](serviceProviderMock);

      // expect
      expect(result).toStrictEqual({
        active: true,
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
      //setup
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({
        exec: mockExec,
      });
      const result = service['findAllServiceProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should have called find once', async () => {
      // setup
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({
        exec: mockExec,
      });
      await service['findAllServiceProvider']();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // setup
      const resultExpected = [
        {
          key: '123',
          active: true,
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
      ];
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      const result = await service['findAllServiceProvider']();

      // expect
      expect(result).toStrictEqual(resultExpected);
    });
  });

  describe('getList', () => {
    it('should resolve', async () => {
      // setup
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      const result = service.getList(true);

      // expect
      expect(result).toBeInstanceOf(Promise);

      await result;
    });

    it('should return service provider list refreshed (refresh forced)', async () => {
      // setup
      const resultExpected = [
        {
          active: true,
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
      ];
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      mockCryptography.decryptSecretHash.mockReturnValueOnce('client_secret');

      // action
      const result = await service.getList(true);

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(resultExpected);
    });

    it('should return service provider list if serviceProviderListCache is not defined', async () => {
      // setup
      const RawServiceProviderNotActiveMock = [
        { _doc: { ...rawServiceProviderFromDBMock[0]._doc, active: false } },
      ];
      const resultExpected = [
        {
          active: false,
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
      ];
      mockExec.mockReturnValueOnce(RawServiceProviderNotActiveMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      mockCryptography.decryptSecretHash.mockReturnValueOnce('client_secret');

      // action
      const result = await service.getList();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(resultExpected);
    });

    it('should return service provider list with the cached version', async () => {
      // setup
      const resultExpected = [
        {
          active: true,
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
      ];
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      mockCryptography.decryptSecretHash.mockReturnValueOnce('client_secret');

      // action
      await service.getList(true);
      const result = await service.getList();

      // expect
      expect(mockRepository.find).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(resultExpected);
    });
  });

  describe('isActive', () => {
    it('Should return true if service provider is active', async () => {
      // setup
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      const result = await service['isActive']('123');

      // expect
      expect(result).toStrictEqual(true);
    });

    it('Should return false if service provider is unactive', async () => {
      // setup
      const RawServiceProviderNotActiveMock = [
        { _doc: { ...rawServiceProviderFromDBMock[0]._doc, active: false } },
      ];
      mockExec.mockReturnValueOnce(RawServiceProviderNotActiveMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      const result = await service['isActive']('123');

      // expect
      expect(result).toStrictEqual(false);
    });

    it('Should return false if service provider is not found', async () => {
      // setup
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });

      // action
      mockExec.mockReturnValueOnce(rawServiceProviderFromDBMock);
      mockRepository.find.mockReturnValueOnce({ exec: mockExec });
      const result = await service['isActive']('456');

      // expect
      expect(result).toStrictEqual(false);
    });
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const serviceProviderFromDBMock = {
        ...rawServiceProviderFromDBMock[0]._doc,
      };
      const resultExpected = {
        active: true,
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
      };
      mockCryptography.decryptSecretHash.mockReturnValueOnce('client_secret');

      // action
      const result = service['legacyToOpenIdPropertyName'](
        serviceProviderFromDBMock,
      );

      // expect
      expect(result).toStrictEqual(resultExpected);
    });
  });
});
