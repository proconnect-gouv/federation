import { singleValidationFactory } from '@gouvfr-lasuite/proconnect.debounce/api';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { FqdnToIdpAdapterMongoService } from '@fc/fqdn-to-idp-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { EmailValidatorService } from './email-validator.service';

jest.mock('@gouvfr-lasuite/proconnect.debounce/api', () => ({
  singleValidationFactory: jest.fn(),
}));

describe(EmailValidatorService.name, () => {
  let service: EmailValidatorService;
  const configServiceMock = getConfigMock();
  const fqdnToIdpAdapterMongoMock = {
    fetchFqdnToIdpByEmail: jest.fn().mockResolvedValue([]),
  };

  const loggerServiceMock = getLoggerMock();
  const apiKeyMock = 'FAKE_API_KEY';
  const testEmail = 'test@example.com';

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        EmailValidatorService,
        FqdnToIdpAdapterMongoService,
        ConfigService,
      ],
    })
      .overrideProvider(FqdnToIdpAdapterMongoService)
      .useValue(fqdnToIdpAdapterMongoMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    configServiceMock.get.mockReturnValue({ debounceApiKey: apiKeyMock });

    service = app.get<EmailValidatorService>(EmailValidatorService);
  });

  describe('validate', () => {
    it('should call config.get with correct parameter', async () => {
      await service.validate(testEmail);
      expect(configServiceMock.get).toHaveBeenCalledOnce();
      expect(configServiceMock.get).toHaveBeenCalledWith('EmailValidator');
    });

    it('should call fetchFqdnToIdpByEmail with the correct email', async () => {
      await service.validate(testEmail);
      expect(
        fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail,
      ).toHaveBeenCalledWith(testEmail);
    });

    it('should not call getSingleValidationMethod when email corresponds to at least one existing FqdnToProvider', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValue([
        { fdqn: 'hogwarts.uk', idp: 'hogwarts' },
      ]);

      (singleValidationFactory as jest.Mock).mockReturnValue(() =>
        Promise.resolve({ send_transactional: '1' }),
      );

      const getSingleValidationMethodSpy = jest.spyOn(
        service as any,
        'getSingleValidationMethod',
      );
      getSingleValidationMethodSpy.mockReturnValue(() =>
        Promise.resolve({ send_transactional: '1' }),
      );

      configServiceMock.get.mockReturnValue({ debounceApiKey: apiKeyMock });

      // When
      await service.validate(testEmail);

      // Then
      expect(
        fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail,
      ).toHaveBeenCalled();
      expect(getSingleValidationMethodSpy).not.toHaveBeenCalled();
      expect(await service.validate(testEmail)).toBe(true);
      expect(loggerServiceMock.info).not.toHaveBeenCalled();
    });

    it('should call getSingleValidationMethod when email corresponds to no existing FqdnToProvider', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValue([]);

      const getSingleValidationMethodSpy = jest.spyOn(
        service as any,
        'getSingleValidationMethod',
      );
      getSingleValidationMethodSpy.mockReturnValue(() =>
        Promise.resolve({ send_transactional: '1' }),
      );

      configServiceMock.get.mockReturnValue({ debounceApiKey: apiKeyMock });

      // When
      await service.validate(testEmail);

      // Then
      expect(
        fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail,
      ).toHaveBeenCalled();
      expect(getSingleValidationMethodSpy).toHaveBeenCalledExactlyOnceWith(
        apiKeyMock,
      );
      expect(await service.validate(testEmail)).toBe(true);
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        `Email address "${testEmail}" is safe to send.`,
      );
    });

    it('should return true even if an error occurred', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValue([]);

      (singleValidationFactory as jest.Mock).mockReturnValue(() =>
        Promise.reject(new Error('An error occurred')),
      );
      // When
      const result = await service.validate(testEmail);

      // Then
      expect(result).toBe(true);
      expect(loggerServiceMock.err).toHaveBeenCalled();
      expect(loggerServiceMock.err).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'An error occurred' }),
      );
    });

    it('should return false when send_transactional is false', async () => {
      // Given
      fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail.mockResolvedValue([]);

      const getSingleValidationMethodSpy = jest.spyOn(
        service as any,
        'getSingleValidationMethod',
      );
      getSingleValidationMethodSpy.mockReturnValue(() =>
        Promise.resolve({ send_transactional: '0' }),
      );

      configServiceMock.get.mockReturnValue({ debounceApiKey: apiKeyMock });

      // When
      await service.validate(testEmail);

      // Then
      expect(
        fqdnToIdpAdapterMongoMock.fetchFqdnToIdpByEmail,
      ).toHaveBeenCalled();
      expect(getSingleValidationMethodSpy).toHaveBeenCalledExactlyOnceWith(
        apiKeyMock,
      );
      expect(await service.validate(testEmail)).toBe(false);
      expect(loggerServiceMock.info).toHaveBeenCalledWith(
        `Email address "${testEmail}" is not safe to send.`,
      );
    });
  });

  describe('getSingleValidationMethod', () => {
    it('should call singleValidationFactory when debounceApiKey is not empty', () => {
      (singleValidationFactory as jest.Mock).mockReturnValue(apiKeyMock);
      service['getSingleValidationMethod'](apiKeyMock);

      expect(singleValidationFactory).toHaveBeenCalledExactlyOnceWith(
        apiKeyMock,
      );
    });

    it('should return a function that returns send_transactional: 1 when debounceApiKey is empty', async () => {
      (singleValidationFactory as jest.Mock).mockReturnValue(apiKeyMock);
      const result = service['getSingleValidationMethod']('');

      expect(result).toBeFunction();
      await expect(result('')).resolves.toEqual({
        send_transactional: '1',
      });

      expect(singleValidationFactory).not.toHaveBeenCalled();
    });
  });
});
