import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { FakeHsmService } from '@fc/fake-hsm';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';

describe('AppController', () => {
  let appController: AppController;

  const signResolvedValue = Buffer.from('signResolvedValue');
  const signMock = jest.fn();

  const hsmServiceMock = {
    sign: signMock,
  };

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [LoggerService, ConfigService, FakeHsmService],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(FakeHsmService)
      .useValue(hsmServiceMock)
      .compile();

    appController = app.get<AppController>(AppController);

    jest.resetAllMocks();
    signMock.mockResolvedValue(signResolvedValue);
    configServiceMock.get.mockReturnValue({ payloadEncoding: 'base64' });
  });

  describe('sign', () => {
    it('should call hsm.sign', async () => {
      // Given
      const payloadMock = { data: 'some string', digest: 'foo' };
      // When
      await appController.sign(payloadMock);
      // Then
      expect(signMock).toHaveBeenCalledTimes(1);
      expect(signMock).toHaveBeenCalledWith(
        expect.any(Buffer),
        payloadMock.digest,
      );
    });
    it('should resolve to stringified hsm.sign response', async () => {
      // Given
      const payloadMock = { data: 'some string', digest: 'foo' };
      const base64result = Buffer.from(signResolvedValue).toString('base64');
      // When
      const result = await appController.sign(payloadMock);
      // Then
      expect(result).toBe(base64result);
    });
    it('should resolve to "ERROR" if execution throwed', async () => {
      // Given
      const payloadMock = { data: 'some string', digest: 'foo' };
      hsmServiceMock.sign.mockRejectedValueOnce(Error('something not good'));
      // When
      const result = await appController.sign(payloadMock);
      // Then
      expect(result).toBe('ERROR');
    });
  });
});
