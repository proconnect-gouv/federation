import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OverrideCode } from '@fc/common';
import { CryptographyService } from './cryptography.service';
import { CryptoOverrideService } from './crypto-override.service';

describe(' CryptoOverrideService', () => {
  let service: CryptoOverrideService;

  const cryptoHighServiceMock = {
    sign: jest.fn(),
    privateDecrypt: jest.fn(),
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const OverrideCodeSpy = jest.spyOn(OverrideCode, 'override');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CryptographyService, CryptoOverrideService, LoggerService],
    })
      .overrideProvider(CryptographyService)
      .useValue(cryptoHighServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .compile();

    service = module.get<CryptoOverrideService>(CryptoOverrideService);
    jest.resetAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should call OverrideCode 3 times', () => {
      // Given
      const OVERRIDE_COUNT = 3;
      // When
      service.onModuleInit();
      // Then
      expect(OverrideCodeSpy).toHaveBeenCalledTimes(OVERRIDE_COUNT);
    });
  });

  describe('crypto.sign', () => {
    it('should call crypto Gateway High Service', async () => {
      // Given
      const alg = 'alg';
      const payload = Symbol('payload');
      const key = Symbol('key');
      // When
      await service['crypto.sign'](alg, payload, key);
      // Then
      expect(cryptoHighServiceMock.sign).toHaveBeenCalledWith(
        key,
        payload,
        alg,
      );
    });
  });

  describe('crypto.privateDecrypt', () => {
    it('should call crypto Gateway High Service', async () => {
      // Given
      const key = Symbol('key');
      const payload = Symbol('payload');
      // When
      await service['crypto.privateDecrypt'](key, payload);
      // Then
      expect(cryptoHighServiceMock.privateDecrypt).toHaveBeenCalledWith(
        key,
        payload,
      );
    });
  });

  describe('crypto.createSecretKey', () => {
    const createSecretKeyMock = jest.fn();
    const wrapped = { createSecretKey: createSecretKeyMock };
    OverrideCode.wrap(wrapped, 'createSecretKey', 'crypto.createSecretKey');

    it('should return a promise if payload is a promise', () => {
      // Given
      const payload = Promise.resolve();
      // When
      const result = service['crypto.createSecretKey'](payload);
      // Then
      expect(result instanceof Promise).toBe(true);
    });

    it('should return a result of createSecrectKey if payload is not a promise', () => {
      // Given
      const responseValue = Symbol('responseValue');
      const payload = Symbol('payload');
      createSecretKeyMock.mockReturnValue(responseValue);
      // When
      const result = service['crypto.createSecretKey'](payload);
      // Then
      expect(result).toBe(responseValue);
    });

    it('should await if payload is a promise and call wrapped crypto.createSecretKey', async () => {
      // Given
      const resolveValue = Symbol('payload');
      const payload = Promise.resolve(resolveValue);
      // When
      await service['crypto.createSecretKey'](payload);
      // Then
      expect(createSecretKeyMock).toHaveBeenCalledWith(resolveValue);
    });
    it('should reject exception', () => {
      // Given
      const exception = new Error('test error');
      const payload = Promise.reject(exception);
      // Then
      expect(service['crypto.createSecretKey'](payload)).rejects.toThrow(
        exception,
      );
    });
    it('should throw catchable exceptions', async () => {
      // Given
      const exception = new Error('test error');
      const payload = Promise.resolve('payload resolved value');
      createSecretKeyMock.mockImplementation(() => {
        throw exception;
      });
      // When
      try {
        await service['crypto.createSecretKey'](payload);
      } catch (error) {
        // then
        expect(error).toBe(exception);
      }
    });
  });
});
