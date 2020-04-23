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
    it('should call OverrideCode 1 times', () => {
      // Given
      const OVERRIDE_COUNT = 1;
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
});
