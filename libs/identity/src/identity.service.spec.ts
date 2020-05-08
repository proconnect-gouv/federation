import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { REDIS_CONNECTION_TOKEN } from '@fc/redis';
import {
  IdentityBadFormatException,
  IdentityNotFoundException,
} from './exceptions';
import {
  IdentityService,
  IDP_IDENTITY_PREFIX,
  SP_IDENTITY_PREFIX,
} from './identity.service';
import { IIdentity } from './interfaces';

describe('IdentityService', () => {
  let service: IdentityService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const redisGetReturnValueMock = 'redisGetReturnValueMock';
  const redisMock = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const cryptographyKeyMock = Symbol('cryptographyKeyMock');
  const cryptographyServiceMock = {
    encryptUserInfosCache: jest.fn(),
    decryptUserInfosCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityService,
        LoggerService,
        ConfigService,
        CryptographyService,
        {
          provide: REDIS_CONNECTION_TOKEN,
          useValue: redisMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<IdentityService>(IdentityService);

    jest.resetAllMocks();

    configServiceMock.get.mockReturnValue({
      cryptographyKey: cryptographyKeyMock,
    });

    cryptographyServiceMock.encryptUserInfosCache.mockReturnValue(
      'encryptUserInfosCache',
    );
    cryptographyServiceMock.decryptUserInfosCache.mockReturnValue(
      '{"foo": "bar"}',
    );

    redisMock.get.mockResolvedValue(redisGetReturnValueMock);
    redisMock.set.mockResolvedValue('OK');
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get cryptoKey', () => {
    it('should call config of module', () => {
      // When
      service['cryptoKey'];
      // Then
      expect(configServiceMock.get).toHaveBeenLastCalledWith('Identity');
    });
    it('should return cryptogaphyKey value from config', () => {
      // When
      const result = service['cryptoKey'];
      // Then
      expect(result).toBe(cryptographyKeyMock);
    });
  });

  describe('serialize', () => {
    // Given
    const dataMock = { foo: 'bar' };

    it('should call encryption service', () => {
      // Given
      const stringifiedData = '{"foo":"bar"}';
      // When
      service['serialize'](dataMock);
      // Then
      expect(
        cryptographyServiceMock.encryptUserInfosCache,
      ).toHaveBeenCalledWith(cryptographyKeyMock, stringifiedData);
    });
    it('should return result of encryption', () => {
      // When
      const result = service['serialize'](dataMock);
      // Then
      expect(result).toEqual('encryptUserInfosCache');
    });
  });

  describe('unserialize', () => {
    // Given
    const dataMock = 'fake encrypted dataMock';

    it('should call decryption service', () => {
      // Given
      const buffer = Buffer.from(dataMock, 'base64');
      // When
      service['unserialize'](dataMock);
      // Then
      expect(
        cryptographyServiceMock.decryptUserInfosCache,
      ).toHaveBeenCalledWith(cryptographyKeyMock, buffer);
    });
    it('should return result of decryption', () => {
      // When
      const result = service['unserialize'](dataMock);
      // Then
      expect(result).toEqual({ foo: 'bar' });
    });
    it('should throw if identity is not parsable JSON', () => {
      // Given
      cryptographyServiceMock.decryptUserInfosCache.mockResolvedValue(
        'not json',
      );
      // Then
      expect(() => {
        service['unserialize'](dataMock);
      }).toThrow(IdentityBadFormatException);
    });
  });

  describe('storeIdentity', () => {
    const key = 'key';
    const dataMock = ({ foo: 'bar' } as unknown) as IIdentity;
    const meta = { identityProviderId: '1337' };

    it('should call serialize with dataMock', async () => {
      // Given
      service['serialize'] = jest.fn();
      // When
      await service['storeIdentity'](key, dataMock, meta);
      // Then
      expect(service['serialize']).toHaveBeenCalledWith({
        identity: dataMock,
        meta,
      });
    });
    it('should call redis set with serialize result', async () => {
      // Given
      const serializeResult = Symbol('serialized result');
      service['serialize'] = jest.fn().mockReturnValue(serializeResult);
      // When
      await service['storeIdentity'](key, dataMock, meta);
      // Then
      expect(redisMock.set).toHaveBeenCalledWith(key, serializeResult);
    });
    it('should return true if set was successfull', async () => {
      // When
      const res = await service['storeIdentity'](key, dataMock, meta);
      // Then
      expect(res).toEqual(true);
    });
    it('should return false if set was NOT successfull', async () => {
      // Given
      redisMock.set.mockResolvedValue(null);
      // When
      const res = await service['storeIdentity'](key, dataMock, meta);
      // Then
      expect(res).toEqual(false);
    });
  });

  describe('getIdentity', () => {
    const key = 'key';

    it('should call redis get with key', async () => {
      // When
      await service['getIdentity'](key);
      // Then
      expect(redisMock.get).toHaveBeenCalledWith(key);
    });
    it('should call unserialize with dataMock from redis get', async () => {
      // Given
      service['unserialize'] = jest.fn();
      // When
      await service['getIdentity'](key);
      // Then
      expect(service['unserialize']).toHaveBeenCalledWith(
        redisGetReturnValueMock,
      );
    });
    it('should return value of unserialize', async () => {
      // Given
      const returnOfUnserialize = Symbol('returnOfUnserialize');
      service['unserialize'] = jest.fn().mockReturnValue(returnOfUnserialize);
      // When
      const result = await service['getIdentity'](key);
      // Then
      expect(result).toBe(returnOfUnserialize);
    });
    it('should throw if identity is not found in redis', async () => {
      // Given
      redisMock.get.mockResolvedValue(false);
      // Then
      await expect(service['getIdentity'](key)).rejects.toThrow(
        IdentityNotFoundException,
      );
    });
  });
  describe('deleteIdentity', () => {
    const key = 'key';

    it('should call redis del with key', async () => {
      // When
      await service['deleteIdentity'](key);
      // Then
      expect(redisMock.del).toHaveBeenCalledWith(key);
    });
    it('should not throw if identity is not found in redis', async () => {
      // Given
      redisMock.del.mockResolvedValue(null);
      // Then
      await expect(service['deleteIdentity'](key)).resolves.not.toThrow();
    });
  });

  describe('shortcuts', () => {
    // Given
    const key = 'key';
    it('should call getIdentity with idp prefix', () => {
      // Given
      service['getIdentity'] = jest.fn();
      // When
      service.getIdpIdentity(key);
      // Then
      expect(service['getIdentity']).toHaveBeenCalledTimes(1);
      expect(service['getIdentity']).toHaveBeenCalledWith(
        `${IDP_IDENTITY_PREFIX}key`,
      );
    });
    it('should call getIdentity with sp prefix', () => {
      // Given
      service['getIdentity'] = jest.fn();
      // When
      service.getSpIdentity(key);
      // Then
      expect(service['getIdentity']).toHaveBeenCalledTimes(1);
      expect(service['getIdentity']).toHaveBeenCalledWith(
        `${SP_IDENTITY_PREFIX}key`,
      );
    });
    it('should call storeIdentity with idp prefix', () => {
      // Given
      const identity = {} as IIdentity;
      const meta = {};
      service['storeIdentity'] = jest.fn();
      // When
      service.storeIdpIdentity(key, identity, meta);
      // Then
      expect(service['storeIdentity']).toHaveBeenCalledTimes(1);
      expect(service['storeIdentity']).toHaveBeenCalledWith(
        `${IDP_IDENTITY_PREFIX}key`,
        identity,
        meta,
      );
    });
    it('should call storeIdentity with sp prefix', () => {
      // Given
      const identity = {} as IIdentity;
      const meta = {};
      service['storeIdentity'] = jest.fn();
      // When
      service.storeSpIdentity(key, identity, meta);
      // Then
      expect(service['storeIdentity']).toHaveBeenCalledTimes(1);
      expect(service['storeIdentity']).toHaveBeenCalledWith(
        `${SP_IDENTITY_PREFIX}key`,
        identity,
        meta,
      );
    });
    it('should call deleteIdentity with idp prefix', () => {
      // Given
      service['deleteIdentity'] = jest.fn();
      // When
      service.deleteIdpIdentity(key);
      // Then
      expect(service['deleteIdentity']).toHaveBeenCalledTimes(1);
      expect(service['deleteIdentity']).toHaveBeenCalledWith(
        `${IDP_IDENTITY_PREFIX}key`,
      );
    });
    it('should call deleteIdentity with sp prefix', () => {
      // Given
      service['deleteIdentity'] = jest.fn();
      // When
      service.deleteSpIdentity(key);
      // Then
      expect(service['deleteIdentity']).toHaveBeenCalledTimes(1);
      expect(service['deleteIdentity']).toHaveBeenCalledWith(
        `${SP_IDENTITY_PREFIX}key`,
      );
    });
  });
});
