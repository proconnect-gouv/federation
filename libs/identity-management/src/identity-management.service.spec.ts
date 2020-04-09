import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { RedisService } from '@fc/redis';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import {
  IdentityManagementBadFormatException,
  IdentityManagementNotFoundException,
} from './exceptions';
import { IdentityManagementService } from './identity-management.service';

describe('IdentityManagementService', () => {
  let service: IdentityManagementService;

  const loggerServiceMock = ({
    setContext: jest.fn(),
    trace: jest.fn(),
    debug: jest.fn(),
  } as unknown) as LoggerService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const redisGetReturnValueMock = 'redisGetReturnValueMock';
  const redisServiceMock = {
    get: jest.fn(),
    set: jest.fn(),
  };

  const cryptographyKeyMock = Symbol('cryptographyKeyMock');
  const cryptographyServiceMock = {
    encryptUserInfosCache: jest.fn(),
    decryptUserInfosCache: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IdentityManagementService,
        LoggerService,
        RedisService,
        ConfigService,
        CryptographyService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(RedisService)
      .useValue(redisServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<IdentityManagementService>(IdentityManagementService);

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

    redisServiceMock.get.mockResolvedValue(redisGetReturnValueMock);
    redisServiceMock.set.mockResolvedValue(true);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('get cryptoKey', () => {
    it('should call config of module', () => {
      // When
      service['cryptoKey'];
      // Then
      expect(configServiceMock.get).toHaveBeenLastCalledWith(
        'IdentityManagement',
      );
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
      }).toThrow(IdentityManagementBadFormatException);
    });
  });

  describe('storeIdentity', () => {
    const key = 'key';
    const dataMock = { foo: 'bar' };

    it('should call serialize with dataMock', () => {
      // Given
      service['serialize'] = jest.fn();
      // When
      service.storeIdentity(key, dataMock);
      // Then
      expect(service['serialize']).toHaveBeenCalledWith(dataMock);
    });
    it('should call redis set with serialize result', () => {
      // Given
      const serializeResult = Symbol('serialized result');
      service['serialize'] = jest.fn().mockReturnValue(serializeResult);
      // When
      service.storeIdentity(key, dataMock);
      // Then
      expect(redisServiceMock.set).toHaveBeenCalledWith(key, serializeResult);
    });
  });

  describe('getIdentity', () => {
    const key = 'key';

    it('should call redis get with key', async () => {
      // When
      await service.getIdentity(key);
      // Then
      expect(redisServiceMock.get).toHaveBeenCalledWith(key);
    });
    it('should call unserialize with dataMock from redis get', async () => {
      // Given
      service['unserialize'] = jest.fn();
      // When
      await service.getIdentity(key);
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
      const result = await service.getIdentity(key);
      // Then
      expect(result).toBe(returnOfUnserialize);
    });
    it('should throw if identity is not found in redis', async () => {
      // Given
      redisServiceMock.get.mockResolvedValue(false);
      // Then
      await expect(service.getIdentity(key)).rejects.toThrow(
        IdentityManagementNotFoundException,
      );
    });
  });
});
