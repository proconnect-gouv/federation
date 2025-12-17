import { resolveMx } from 'node:dns/promises';

import { Test, TestingModule } from '@nestjs/testing';

import { AccountFcaService } from '@fc/account-fca';
import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';

import { getConfigMock } from '@mocks/config';
import { getLoggerMock } from '@mocks/logger';

import { EmailValidatorService } from './email-validator.service';

jest.mock('node:dns/promises', () => ({
  resolveMx: jest.fn(),
}));

describe(EmailValidatorService.name, () => {
  let service: EmailValidatorService;
  const configServiceMock = getConfigMock();
  const identityProviderAdapterMongoMock = {
    getIdpsByEmail: jest.fn(),
    getFqdnFromEmail: jest.fn(),
    getList: jest.fn(),
  };
  const accountFcaServiceMock = {
    checkEmailExists: jest.fn(),
  };

  const loggerServiceMock = getLoggerMock();
  const testEmail = 'user@test.example.com';
  const testDomain = 'test.example.com';

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    (resolveMx as jest.Mock).mockReset();

    (
      identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock
    ).mockResolvedValue([]);
    (
      identityProviderAdapterMongoMock.getFqdnFromEmail as jest.Mock
    ).mockReturnValue(testDomain);
    (accountFcaServiceMock.checkEmailExists as jest.Mock).mockResolvedValue(
      false,
    );

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        LoggerService,
        EmailValidatorService,
        IdentityProviderAdapterMongoService,
        ConfigService,
        AccountFcaService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderAdapterMongoMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(AccountFcaService)
      .useValue(accountFcaServiceMock)
      .compile();

    configServiceMock.get.mockReturnValue({ domainWhitelist: [] });

    service = app.get<EmailValidatorService>(EmailValidatorService);
  });

  describe('getIdpDomains', () => {
    it('should return a list of domains from IdPs', async () => {
      // Given
      const mockIdps = [
        { fqdns: ['idp1.example.com', 'idp2.example.com'] },
        { fqdns: ['idp3.example.com'] },
        { fqdns: [] }, // IdP with no domains
        { fqdns: null }, // IdP with null domains
      ];
      identityProviderAdapterMongoMock.getList.mockResolvedValue(mockIdps);

      // When
      const domains = await service['getIdpDomains']();

      // Then
      expect(identityProviderAdapterMongoMock.getList).toHaveBeenCalled();
      expect(domains).toEqual([
        'idp1.example.com',
        'idp2.example.com',
        'idp3.example.com',
      ]);
    });
  });

  describe('getEmailSuggestion', () => {
    it('should return a suggested email when a close match is found', () => {
      // Given
      const tests = [
        {
          emails: ['test@gendramerie.interieur.gouv.fr'],
          expected: 'test@gendarmerie.interieur.gouv.fr',
        },
      ];
      const idpDomains = ['gendarmerie.interieur.gouv.fr'];

      // When
      tests.forEach(({ emails, expected }) => {
        emails.forEach((email) => {
          const suggestion = service['getEmailSuggestion'](email, idpDomains);

          // Then
          expect(suggestion).toBe(expected);
        });
      });
    });
  });

  describe('validate', () => {
    it('should call config.get with correct parameter', async () => {
      await service.validate(testEmail);
      expect(configServiceMock.get).toHaveBeenCalledOnce();
      expect(configServiceMock.get).toHaveBeenCalledWith('EmailValidator');
    });

    it('should call getIdpsByEmail with the correct email', async () => {
      await service.validate(testEmail);
      expect(
        identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock,
      ).toHaveBeenCalledWith(testEmail);
    });

    it('should return true when email corresponds to at least one existing IdP and not proceed further', async () => {
      // Given
      (
        identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock
      ).mockResolvedValue([{ fdqns: ['hogwarts.uk'] }]);

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(result).toEqual({ isEmailValid: true });
      expect(accountFcaServiceMock.checkEmailExists).not.toHaveBeenCalled();
      expect(resolveMx).not.toHaveBeenCalled();
      expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    });

    it('should return true when email exists in FCA account base and not proceed further', async () => {
      // Given
      (
        identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock
      ).mockResolvedValue([]);
      (accountFcaServiceMock.checkEmailExists as jest.Mock).mockResolvedValue(
        true,
      );

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(
        identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock,
      ).toHaveBeenCalled();
      expect(accountFcaServiceMock.checkEmailExists).toHaveBeenCalledWith(
        testEmail,
      );
      expect(resolveMx).not.toHaveBeenCalled();
      expect(result).toEqual({ isEmailValid: true });
      expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    });

    it('should return true when domain is whitelisted and not call resolveMx', async () => {
      // Given
      configServiceMock.get.mockReturnValue({ domainWhitelist: [testDomain] });

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(
        identityProviderAdapterMongoMock.getFqdnFromEmail,
      ).toHaveBeenCalledWith(testEmail);
      expect(resolveMx).not.toHaveBeenCalled();
      expect(result).toEqual({ isEmailValid: true });
    });

    it('should call resolveMx with domain and return true when MX records are found', async () => {
      // Given
      (resolveMx as jest.Mock).mockResolvedValue([
        { exchange: 'mx.test', priority: 10 },
      ]);

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(
        identityProviderAdapterMongoMock.getFqdnFromEmail,
      ).toHaveBeenCalledWith(testEmail);
      expect(resolveMx).toHaveBeenCalledWith(testDomain);
      expect(result).toEqual({ isEmailValid: true });
      expect(loggerServiceMock.warn).not.toHaveBeenCalled();
    });

    it('should return false and log a warn when MX lookup fails', async () => {
      // Given
      (resolveMx as jest.Mock).mockRejectedValue(new Error('NXDOMAIN'));

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(resolveMx).toHaveBeenCalledWith(testDomain);
      expect(result).toEqual({ isEmailValid: false, suggestion: '' });
    });

    it('should return true and log the error when a top-level error occurs', async () => {
      // Given a top-level failure before isEmailDomainValid is called
      (
        identityProviderAdapterMongoMock.getIdpsByEmail as jest.Mock
      ).mockRejectedValue(new Error('db down'));

      // When
      const result = await service.validate(testEmail);

      // Then
      expect(result).toEqual({ isEmailValid: true });
      expect(loggerServiceMock.error).toHaveBeenCalled();
      expect(loggerServiceMock.error).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'db down' }),
      );
    });

    it('should return false without suggestion when email domain is invalid and no suggestion is available', async () => {
      // Given
      (resolveMx as jest.Mock).mockRejectedValue(
        new Error('No MX records found'),
      ); // No MX records found

      identityProviderAdapterMongoMock.getList.mockResolvedValue([]);

      // When
      const result = await service.validate('user@test.exmple.com');

      // Then
      expect(result.isEmailValid).toBe(false);
      expect(result.suggestion).toBe('');
    });

    it('should return false with suggestion when email domain is invalid', async () => {
      // Given
      (resolveMx as jest.Mock).mockRejectedValue(
        new Error('No MX records found'),
      ); // No MX records found

      identityProviderAdapterMongoMock.getList.mockResolvedValue([
        { fqdns: ['test.example.com'] },
      ]);

      // When
      const result = await service.validate('user@test.exmple.com');

      // Then
      expect(result.isEmailValid).toBe(false);
      expect(result.suggestion).toBe('user@test.example.com');
    });
  });
});
