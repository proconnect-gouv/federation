import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { CryptographyService } from '@fc/cryptography';
import { AccountService, AccountBlockedException } from '@fc/account';
import { MailerService } from '@fc/mailer';
import { TrackingService } from '@fc/tracking';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpService', () => {
  let service: CoreFcpService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const mailerServiceMock = {
    send: jest.fn(),
  };

  const uidMock = '42';

  const getInteractionResultMock = {
    prompt: {},

    params: {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas3',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      client_id: 'spId',
    },
    uid: uidMock,
  };
  const getInteractionMock = jest.fn();

  const oidcProviderServiceMock = {
    getInteraction: getInteractionMock,
    registerMiddleware: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const accountServiceMock = {
    storeInteraction: jest.fn(),
    isBlocked: jest.fn(),
  };

  const rnippServiceMock = {
    check: jest.fn(),
  };

  const spIdentityMock = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    given_name: 'Edward',
    // eslint-disable-next-line @typescript-eslint/naming-convention
    family_name: 'TEACH',
    email: 'eteach@fqdn.ext',
  };

  const idpIdentityMock = {
    sub: 'some idpSub',
  };

  const cryptographyServiceMock = {
    computeIdentityHash: jest.fn(),
    computeSubV2: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const reqMock = {
    fc: { interactionId: uidMock },
    ip: '123.123.123.123',
  };

  const trackingMock = {
    track: jest.fn(),
  };

  const sessionDataMock = {
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    idpIdentity: idpIdentityMock,

    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
    spIdentity: spIdentityMock,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoreFcpService,
        LoggerService,
        ConfigService,
        OidcProviderService,
        SessionService,
        RnippService,
        CryptographyService,
        AccountService,
        MailerService,
        TrackingService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(RnippService)
      .useValue(rnippServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .overrideProvider(AccountService)
      .useValue(accountServiceMock)
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .compile();

    configServiceMock.get.mockReturnValue({
      forcedPrompt: ['testprompt'],
      configuration: {
        routes: { authorization: '/foo' },
      },
      // OidcProvider.configuration
      acrValues: ['Boots', 'Motorcycles', 'Glasses'],
    });

    service = module.get<CoreFcpService>(CoreFcpService);

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    rnippServiceMock.check.mockResolvedValue(spIdentityMock);
    accountServiceMock.isBlocked.mockResolvedValue(false);

    /**
     * @TODO #258
     * ETQ Dev, je "clear" également les mocks au lieu de seulement les "reset"
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/258
     */
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify', () => {
    let checkBlockedMock;
    let checkAcrMock;
    beforeEach(() => {
      checkBlockedMock = jest.spyOn<CoreFcpService, any>(
        service,
        'checkIfAccountIsBlocked',
      );
      checkBlockedMock.mockResolvedValue(true); // nothing happened

      checkAcrMock = jest.spyOn<CoreFcpService, any>(
        service,
        'checkIfAcrIsValid',
      );
      checkAcrMock.mockResolvedValue(true); // nothing happened
    });

    it('Should not throw if verified', async () => {
      // Then
      await expect(service.verify(reqMock)).resolves.not.toThrow();
    });

    it('Should throw if account is blocked', async () => {
      // Given
      const errorMock = new AccountBlockedException();
      checkBlockedMock.mockRejectedValueOnce(errorMock);

      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    // Dependencies sevices errors
    it('Should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error 1');
      checkAcrMock.mockImplementation(() => {
        throw errorMock;
      });
      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if identity provider is not usable', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if rnipp check refuses identity', async () => {
      // Given
      const errorMock = new Error('my error');
      rnippServiceMock.check.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if identity storage for service provider fails', async () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.patch.mockRejectedValueOnce(errorMock);
      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    // Non blocking errors
    it('Should pass if interaction storage fails', async () => {
      // Given
      const error = new Error('some error');
      accountServiceMock.storeInteraction.mockRejectedValueOnce(error);
      // When
      await expect(service.verify(reqMock)).resolves.not.toThrow();
    });

    it('Should log a warning if interaction storage fails', async () => {
      // Given

      const error = new Error('some error');
      accountServiceMock.storeInteraction.mockRejectedValueOnce(error);
      // When
      await service.verify(reqMock);
      // Then
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
      expect(loggerServiceMock.warn).toHaveBeenCalledWith(
        'Could not persist interaction to database',
      );
    });

    /**
     * @TODO #134 Test when implemented
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/134
     *
     * // RNIPP resilience
     * it('Should pass if rnipp is down and account is known', async () => {});
     * it('Should throw if rnipp is down and account is unknown', async () => {});
     *
     * // Service provider usability
     * it('Should throw if service provider is not usable ', async () => {});
     */
  });

  describe('rnippCheck', () => {
    it('should not throw if rnipp service does not', async () => {
      // Then
      expect(
        service['rnippCheck'](spIdentityMock, reqMock),
      ).resolves.not.toThrow();
    });

    it('should return rnippIdentity', async () => {
      // When
      const result = await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(result).toBe(spIdentityMock);
    });

    it('should publish events when searching', async () => {
      // When
      await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(2);
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippRequestedEvent,
        expect.any(Object),
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippReceivedValidEvent,
        expect.any(Object),
      );
    });

    it('should add interactionId and Ip address properties in published events', async () => {
      // Given
      const expectedEventStruct = {
        fc: { interactionId: '42' },
        ip: '123.123.123.123',
      };
      // When
      await service['rnippCheck'](spIdentityMock, reqMock);
      // Then
      expect(trackingMock.track).toHaveBeenCalledTimes(2);
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippRequestedEvent,
        expectedEventStruct,
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        RnippReceivedValidEvent,
        expectedEventStruct,
      );
    });
  });
});
