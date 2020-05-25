import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OverrideCode } from '../helpers';
import { CryptoOverrideService } from './crypto-override.service';
import { CryptographyGatewayException } from '../exceptions';

describe(' CryptoOverrideService', () => {
  let service: CryptoOverrideService;

  const configServiceMock = {
    get: jest.fn(),
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  };

  const messageMock = {
    pipe: jest.fn(),
  };

  const brokerMock = {
    send: jest.fn(),
    connect: jest.fn(),
    close: jest.fn(),
  };

  const pipeMock = {
    subscribe: jest.fn(),
  };

  const brokerResponseMock = 'brokerResponseMock';

  const OverrideCodeSpy = jest.spyOn(OverrideCode, 'override');

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoOverrideService,
        ConfigService,
        LoggerService,
        {
          provide: 'CryptographyBroker',
          useValue: brokerMock,
        },
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    service = module.get<CryptoOverrideService>(CryptoOverrideService);
    jest.resetAllMocks();
    brokerMock.send.mockReturnValue(messageMock);
    messageMock.pipe.mockReturnValue(pipeMock);
    pipeMock.subscribe.mockImplementation(cb => cb(brokerResponseMock));
    configServiceMock.get.mockReturnValue({
      payloadEncoding: 'base64',
      requestTimeout: 200,
    });
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
    it('should call broker.connect', () => {
      // When
      service.onModuleInit();
      // Then
      expect(brokerMock.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe('onModuleDestroy', () => {
    it('should call broker.close', () => {
      // When
      service.onModuleDestroy();
      // Then
      expect(brokerMock.close).toHaveBeenCalledTimes(1);
    });
  });
  describe('crypto.sign', () => {
    it('should call crypto Gateway High Service', async () => {
      // Given
      const alg = 'alg';
      const payload = Symbol('payload');
      const key = Symbol('key');
      service.sign = jest.fn();
      // When
      await service['crypto.sign'](alg, payload, key);
      // Then
      expect(service.sign).toHaveBeenCalledWith(key, payload, alg);
    });
  });

  describe('sign', () => {
    // Given
    const keyMock = 'key';
    const dataMock = Buffer.from('data');
    const digestMock = 'digest';

    /**
     * @TODO refactor tests according to extraction of success and failure callbacks
     */
    describe('sign', () => {
      it('should return promise', async () => {
        // When
        const result = service.sign(keyMock, dataMock, digestMock);

        // Then
        expect(result instanceof Promise);

        // Clean
        await result;
      });

      it('should reject if response is "ERROR"', async () => {
        // Given
        pipeMock.subscribe.mockImplementationOnce(cb => cb('ERROR'));

        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });

      it('should reject if something turnd bad', async () => {
        // Given
        pipeMock.subscribe.mockImplementationOnce(() => {
          throw Error('not good');
        });

        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });

      it('should reject if observable throws', async () => {
        // Given
        const error = Error('not good');
        pipeMock.subscribe.mockImplementationOnce((_success, failure) => {
          failure(error);
        });

        // Then
        await expect(service.sign(keyMock, dataMock)).rejects.toThrow(
          CryptographyGatewayException,
        );
      });
    });
  });
});
