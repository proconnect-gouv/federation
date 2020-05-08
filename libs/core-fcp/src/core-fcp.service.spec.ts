import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { IdentityService } from '@fc/identity';
import { RnippService } from '@fc/rnipp';
import { CryptographyService } from '@fc/cryptography';
import { AccountService, AccountBlockedException } from '@fc/account';

import {
  CoreFcpLowAcrException,
  CoreFcpInvalidAcrException,
} from './exceptions';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpService', () => {
  let service: CoreFcpService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = 42;

  const getInteractionResultMock = {
    prompt: {},

    params: {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/camelcase
      acr_values: 'eidas3',
    },
    uid: uidMock,
  };
  const getInteractionMock = jest.fn();

  const oidcProviderServiceMock = {
    getInteraction: getInteractionMock,
  };

  const identityServiceMock = {
    getIdpIdentity: jest.fn(),
    storeSpIdentity: jest.fn(),
    deleteIdpIdentity: jest.fn(),
  };

  const accountServiceMock = {
    storeInteraction: jest.fn(),
    isBlocked: jest.fn(),
  };

  const rnippServiceMock = {
    check: jest.fn(),
  };

  const identityMock = {};

  const cryptographyServiceMock = {
    computeIdentityHash: jest.fn(),
    computeSubV2: jest.fn(),
  };

  const reqMock = {
    session: { uid: uidMock },
  };

  const resMock = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcpService,
        LoggerService,
        OidcProviderService,
        IdentityService,
        RnippService,
        CryptographyService,
        AccountService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(IdentityService)
      .useValue(identityServiceMock)
      .overrideProvider(RnippService)
      .useValue(rnippServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .compile();

    service = module.get<CoreFcpService>(CoreFcpService);

    jest.resetAllMocks();

    getInteractionMock.mockResolvedValue(getInteractionResultMock);

    identityServiceMock.getIdpIdentity.mockResolvedValue({
      identity: identityMock,
      meta: { identityProviderId: '42', acr: 'eidas3' },
    });

    rnippServiceMock.check.mockResolvedValue(identityMock);
    accountServiceMock.isBlocked.mockResolvedValue(false);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getConsent', () => {
    it('Should return interaction details and identity', async () => {
      // When
      const result = await service.getConsent(reqMock, resMock);
      // Then
      expect(result).toEqual(
        expect.objectContaining({
          identity: identityMock,
          interactionId: uidMock,
        }),
      );
    });

    // Dependencies sevices errors
    it('Should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error');
      service['checkIfAcrIsValid'] = jest.fn().mockImplementationOnce(() => {
        throw errorMock;
      });
      // Then
      await expect(service.getConsent(reqMock, resMock)).rejects.toThrow(
        errorMock,
      );
    });
    it('Should throw if session is not found', async () => {
      // Given
      const errorMock = new Error('my error');
      oidcProviderServiceMock.getInteraction.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(errorMock);
    });
    it('Should throw if identity provider is not usable', () => {
      // Given
      const errorMock = new Error('my error');
      identityServiceMock.getIdpIdentity.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(errorMock);
    });
    it('Should throw if rnipp check refuses identity', () => {
      // Given
      const errorMock = new Error('my error');
      rnippServiceMock.check.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(errorMock);
    });
    it('Should throw if identity storage for service provider fails', () => {
      // Given
      const errorMock = new Error('my error');
      identityServiceMock.storeSpIdentity.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(errorMock);
    });
    it('should throw if account is blocked', () => {
      // Given
      accountServiceMock.isBlocked.mockResolvedValue(true);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(
        AccountBlockedException,
      );
    });
    it('should throw if account blocked check fails', () => {
      // Given
      const error = new Error('foo');
      accountServiceMock.isBlocked.mockRejectedValueOnce(error);
      // Then
      expect(service.getConsent(reqMock, resMock)).rejects.toThrow(error);
    });

    // Non blocking errors
    it('Should pass if interaction storage fails', () => {
      // Given
      const error = new Error('some error');
      accountServiceMock.storeInteraction.mockRejectedValueOnce(error);
      // When
      expect(service.getConsent(reqMock, resMock)).resolves.not.toThrow();
    });

    it('Should log a warning if interaction storage fails', async () => {
      // Given
      const error = new Error('some error');
      accountServiceMock.storeInteraction.mockRejectedValueOnce(error);
      // When
      await service.getConsent(reqMock, resMock);
      // Then
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.warn).toHaveBeenCalledWith(
        'Could not persist interaction to database',
      );
    });

    /**
     * @TODO Test when implemented
     *
     * // RNIPP resilience
     * it('Should pass if rnipp is down and account is known', async () => {});
     * it('Should throw if rnipp is down and account is unknown', async () => {});
     *
     * // Service provider usability
     * it('Should throw if service provider is not usable ', async () => {});
     */
  });

  describe('checkIfAcrIsValid', () => {
    it('should throw if received is not valid', () => {
      // Given
      const received = 'someInvalidString';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });
    it('should throw if requested is not valid', () => {
      // Given
      const received = 'eidas3';
      const requested = 'someInvalidString';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });

    it('should throw if requested is empty', () => {
      // Given
      const received = 'eidas3';
      const requested = '';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });
    it('should throw if received is empty', () => {
      // Given
      const received = '';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });

    it('should throw if requested is undefined', () => {
      // Given
      const received = 'eidas3';
      const requested = undefined;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });
    it('should throw if received is undefined', () => {
      // Given
      const received = undefined;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });

    it('should throw if requested is null', () => {
      // Given
      const received = 'eidas3';
      const requested = null;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });
    it('should throw if received is null', () => {
      // Given
      const received = null;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpInvalidAcrException);
    });

    it('should throw if received is lower than requested (1 vs 2)', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpLowAcrException);
    });

    it('should throw if received is lower than requested (2 vs 3)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas3';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreFcpLowAcrException);
    });

    it('should not throw if received is equal to requested for level eidas1', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas1';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is equal to requested for level eidas2', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is equal to requested for level eidas3', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas3';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });

    it('should not throw if received is higher then requested (2 vs 1)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas1';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
    it('should not throw if received is higher then requested (3 vs 2)', () => {
      // Given
      const received = 'eidas3';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).not.toThrow();
    });
  });
});
