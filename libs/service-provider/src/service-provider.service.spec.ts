/* eslint-disable @typescript-eslint/naming-convention */
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';

import { ServiceProviderService } from './service-provider.service';
import { CryptographyService } from '@fc/cryptography';
import { CustomClientMetadata } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';

describe('ServiceProviderService', () => {
  let service: ServiceProviderService;

  const validServiceProviderMock = {
    _doc: {
      key: '123',
      active: true,
      name: 'foo',
      client_secret: "This is an encrypted string, don't ask !",
      scopes: ['openid', 'profile'],
      redirect_uris: ['https://sp-site.fr/redirect_uris'],
      post_logout_redirect_uris: [
        'https://sp-site.fr/post_logout_redirect_uris',
      ],
      id_token_signed_response_alg: 'ES256',
      id_token_encrypted_response_alg: 'RS256',
      id_token_encrypted_response_enc: 'AES256GCM',
      userinfo_encrypted_response_alg: 'RS256',
      userinfo_encrypted_response_enc: 'AES256GCM',
      userinfo_signed_response_alg: 'ES256',
      jwks_uri: 'https://sp-site.fr/jwks-uri',
    },
  };

  const invalidServiceProviderMock = {
    _doc: {
      ...validServiceProviderMock._doc,
      active: 'NOT_A_BOOLEAN',
    },
  };

  const serviceProviderListMock = [validServiceProviderMock];

  const loggerMock = {
    setContext: jest.fn(),
    warn: jest.fn(),
  };

  const cryptographyMock = {
    decryptClientSecret: jest.fn(),
  };

  const repositoryMock = {
    find: jest.fn(),
    exec: jest.fn(),
  };

  const serviceProviderModel = getModelToken('ServiceProvider');

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptographyService,
        ServiceProviderService,
        {
          provide: serviceProviderModel,
          useValue: repositoryMock,
        },
        LoggerService,
      ],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptographyMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    service = module.get<ServiceProviderService>(ServiceProviderService);

    repositoryMock.find.mockReturnValueOnce(repositoryMock);
    repositoryMock.exec.mockResolvedValueOnce(serviceProviderListMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('legacyToOpenIdPropertyName', () => {
    it('should return service provider with change legacy property name by openid property name', () => {
      // setup
      const expected = {
        ...validServiceProviderMock._doc,
        client_id: validServiceProviderMock._doc.key,
        client_secret: 'client_secret',
        scope: validServiceProviderMock._doc.scopes.join(' '),
      };
      delete expected.key;
      delete expected.scopes;

      // action
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected.client_secret,
      );
      const result = service['legacyToOpenIdPropertyName'](
        validServiceProviderMock._doc,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });

  describe('findAllServiceProvider', () => {
    it('should resolve', async () => {
      // action
      const result = service['findAllServiceProvider']();

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should have called find once', async () => {
      // action
      await service['findAllServiceProvider']();

      // expect
      expect(repositoryMock.find).toHaveBeenCalledTimes(1);
    });

    it('should return result of type list', async () => {
      // action
      const result = await service['findAllServiceProvider']();

      // expect
      expect(result).toStrictEqual(
        serviceProviderListMock.map(({ _doc }) => _doc),
      );
    });

    it('should log a warning if an entry is exluded by the DTO', async () => {
      // setup
      const invalidServiceProviderListMock = [
        validServiceProviderMock,
        invalidServiceProviderMock,
      ];

      repositoryMock.exec = jest
        .fn()
        .mockResolvedValueOnce(invalidServiceProviderListMock);

      // action
      await service['findAllServiceProvider']();

      // expect
      expect(loggerMock.warn).toHaveBeenCalledTimes(1);
    });

    it('should filter out any entry exluded by the DTO', async () => {
      // setup
      const invalidServiceProviderListMock = [
        validServiceProviderMock,
        invalidServiceProviderMock,
      ];

      repositoryMock.exec = jest
        .fn()
        .mockResolvedValueOnce(invalidServiceProviderListMock);

      // action
      const result = await service['findAllServiceProvider']();

      // expect
      expect(result).toEqual(serviceProviderListMock.map(({ _doc }) => _doc));
    });
  });

  describe('getList', () => {
    beforeEach(() => {
      service['findAllServiceProvider'] = jest
        .fn()
        .mockResolvedValueOnce(serviceProviderListMock.map(({ _doc }) => _doc));
    });

    it('should resolve', async () => {
      // setup

      // action
      const result = service.getList(true);

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should return service provider list refreshed (refresh forced)', async () => {
      const expected = [
        {
          ...validServiceProviderMock._doc,
          client_id: '123',
          client_secret: 'client_secret',
          scope: 'openid profile',
        },
      ];
      delete expected[0].key;
      delete expected[0].scopes;
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected[0].client_secret,
      );

      // action
      const result = await service.getList(true);

      // expect
      expect(service['findAllServiceProvider']).toHaveBeenCalledTimes(1);
      expect(result).toStrictEqual(expected);
    });

    it('should return service provider list if serviceProviderListCache is not defined', async () => {
      // setup
      service['listCache'] = ([
        { client_id: 'foo' },
        { client_id: 'bar' },
      ] as unknown) as CustomClientMetadata[];
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
          ...validServiceProviderMock._doc,
          client_id: '123',
          client_secret: 'client_secret',
          scope: 'openid profile',
        },
      ];
      delete expected[0].key;
      delete expected[0].scopes;
      cryptographyMock.decryptClientSecret.mockReturnValueOnce(
        expected[0].client_secret,
      );

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
      { client_id: 'wizz' },
      { client_id: 'foo' },
      { client_id: 'bar' },
    ];

    it('should return an existing SP', async () => {
      // Given
      const idMock = 'foo';
      service.getList = jest.fn().mockResolvedValueOnce(spListMock);
      // When
      const result = await service.getById(idMock);
      // Then
      expect(result).toEqual({ client_id: 'foo' });
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
        ...validServiceProviderMock._doc,
        client_id: '123',
        client_secret: 'client_secret',
        scope: 'openid profile',
      };
      delete expected.key;
      delete expected.scopes;

      cryptographyMock.decryptClientSecret.mockReturnValueOnce('client_secret');

      // action
      const result = service['legacyToOpenIdPropertyName'](
        validServiceProviderMock._doc,
      );

      // expect
      expect(result).toStrictEqual(expected);
    });
  });
});
