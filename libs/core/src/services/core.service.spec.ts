import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService, OidcCtx } from '@fc/oidc-provider';
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
import { CoreLowAcrException, CoreInvalidAcrException } from '../exceptions';
import { CoreService } from './core.service';

describe('CoreService', () => {
  let service: CoreService;

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
        CoreService,
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

    service = module.get<CoreService>(CoreService);

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

  describe('onModuleInit', () => {
    it('should register ovrrideAuthorizePrompt middleware', () => {
      // Given
      service['overrideAuthorizePrompt'] = jest.fn();
      service['overrideAuthorizeAcrValues'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        2,
      );
      expect(service['overrideAuthorizePrompt']).toHaveBeenCalledTimes(0);
      expect(service['overrideAuthorizeAcrValues']).toHaveBeenCalledTimes(0);
    });
  });

  describe('overrideAuthorizePrompt', () => {
    it('should set prompt parameter on query', () => {
      // Given
      const ctxMock = {
        method: 'GET',
        query: {},
      } as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.query.prompt).toBe(overridePrompt);
      expect(ctxMock.body).toBeUndefined();
    });
    it('should set prompt parameter on body', () => {
      // Given
      const ctxMock = ({
        method: 'POST',
        req: { body: {} },
      } as unknown) as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.req['body'].prompt).toBe(overridePrompt);
      expect(ctxMock.query).toBeUndefined();
    });
    it('should not do anything but log if there is no method declared', () => {
      // Given
      const ctxMock = {} as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock).toEqual({});
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('overrideAuthorizeAcrValues', () => {
    const allowedAcrMock = ['boots', 'clothes', 'motorcycle'];
    it('should set acr values parameter on query', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = {
        method: 'GET',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        query: { acr_values: 'Boots' },
      } as OidcCtx;

      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock.query.acr_values).toBe(overrideAcr);
      expect(ctxMock.body).toBeUndefined();
    });
    it('should set acr values parameter on body', () => {
      // Given
      const overrideAcr = 'boots';
      const ctxMock = ({
        method: 'POST',
        // Oidc Naming convention
        // eslint-disable-next-line @typescript-eslint/naming-convention
        req: { body: { acr_values: 'Boots' } },
      } as unknown) as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock.req['body'].acr_values).toBe(overrideAcr);
      expect(ctxMock.query).toBeUndefined();
    });
    it('should not do anything but log if there is no method declared', () => {
      // Given
      const ctxMock = {} as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock).toEqual({});
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
    it('should not do anything but log if method is not handled', () => {
      // Given
      const ctxMock = { method: 'DELETE' } as OidcCtx;
      // When
      service['overrideAuthorizeAcrValues'](allowedAcrMock, ctxMock);
      // Then
      expect(ctxMock).toEqual({ method: 'DELETE' });
      expect(loggerServiceMock.warn).toHaveBeenCalledTimes(1);
    });
  });

  describe('verify', () => {
    let checkBlockedMock;
    let checkAcrMock;
    beforeEach(() => {
      checkBlockedMock = jest.spyOn<CoreService, any>(
        service,
        'checkIfAccountIsBlocked',
      );
      checkBlockedMock.mockResolvedValue(true); // nothing happened

      checkAcrMock = jest.spyOn<CoreService, any>(
        service,
        'checkIfAcrIsValid',
      );
      checkAcrMock.mockResolvedValue(true); // nothing happened
    });

    it('Should not throw if verified', async () => {
      // Then
      expect(service.verify(reqMock)).resolves.not.toThrow();
    });

    it('Should throw if account is blocked', async () => {
      // Given
      const errorMock = new AccountBlockedException();
      checkBlockedMock.mockRejectedValueOnce(errorMock);

      // Then
      expect(service.verify(reqMock)).rejects.toThrow(errorMock);
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

    it('Should throw if identity provider is not usable', () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.get.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if rnipp check refuses identity', () => {
      // Given
      const errorMock = new Error('my error');
      rnippServiceMock.check.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('Should throw if identity storage for service provider fails', () => {
      // Given
      const errorMock = new Error('my error');
      sessionServiceMock.patch.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    // Non blocking errors
    it('Should pass if interaction storage fails', () => {
      // Given
      const error = new Error('some error');
      accountServiceMock.storeInteraction.mockRejectedValueOnce(error);
      // When
      expect(service.verify(reqMock)).resolves.not.toThrow();
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

  describe('checkIfAccountIsBlocked', () => {
    it('Should go through check if account is not blocked', async () => {
      // Given
      const identityMock = {};
      // Then
      await service['checkIfAccountIsBlocked'](identityMock);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });
    it('Should throw if account is blocked', async () => {
      // Given
      accountServiceMock.isBlocked.mockResolvedValue(true);
      const identityMock = {};
      // Then
      await expect(
        service['checkIfAccountIsBlocked'](identityMock),
      ).rejects.toThrow(AccountBlockedException);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });

    it('Should throw if account blocked check fails', async () => {
      // Given
      const error = new Error('foo');
      accountServiceMock.isBlocked.mockRejectedValueOnce(error);
      const identityMock = {};
      // Then
      await expect(
        service['checkIfAccountIsBlocked'](identityMock),
      ).rejects.toThrow(error);

      expect(accountServiceMock.isBlocked).toBeCalledTimes(1);
    });
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

  describe('checkIfAcrIsValid', () => {
    it('should throw if received is not valid', () => {
      // Given
      const received = 'someInvalidString';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if requested is not valid', () => {
      // Given
      const received = 'eidas3';
      const requested = 'someInvalidString';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is empty', () => {
      // Given
      const received = 'eidas3';
      const requested = '';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is empty', () => {
      // Given
      const received = '';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is undefined', () => {
      // Given
      const received = 'eidas3';
      const requested = undefined;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is undefined', () => {
      // Given
      const received = undefined;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if requested is null', () => {
      // Given
      const received = 'eidas3';
      const requested = null;
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });
    it('should throw if received is null', () => {
      // Given
      const received = null;
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreInvalidAcrException);
    });

    it('should throw if received is lower than requested (1 vs 2)', () => {
      // Given
      const received = 'eidas1';
      const requested = 'eidas2';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreLowAcrException);
    });

    it('should throw if received is lower than requested (2 vs 3)', () => {
      // Given
      const received = 'eidas2';
      const requested = 'eidas3';
      // When
      const call = () => service['checkIfAcrIsValid'](received, requested);
      // Then
      expect(call).toThrow(CoreLowAcrException);
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

  describe('sendAuthenticationMail', () => {
    beforeEach(() => {
      // avoid to count config.get in constructor
      configServiceMock.get.mockReset();
      configServiceMock.get.mockReturnValue({
        from: 'mail@mail.com',
      });
    });

    it('should return a promise', async () => {
      // action
      const result = service.sendAuthenticationMail(reqMock);

      // expect
      expect(result).toBeInstanceOf(Promise);
    });

    it('should retrieve the email to send from from config', async () => {
      // setup
      const configName = 'Mailer';

      // action
      await service.sendAuthenticationMail(reqMock);

      // expect
      expect(configServiceMock.get).toBeCalledTimes(1);
      expect(configServiceMock.get).toBeCalledWith(configName);
    });

    it('should call SessionService.get with interactionId', async () => {
      // action
      await service.sendAuthenticationMail(reqMock);

      // expect
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(reqMock.fc.interactionId);
    });

    it('should send the email to the end-user by calling "mailer.send"', async () => {
      // setup
      const fromMock = { email: 'address@fqdn.ext', name: 'Address' };
      const expectedEmailParams = {
        body: `Connexion établie via ${sessionDataMock.idpName} !`,
        from: fromMock,
        subject: `Connexion depuis FranceConnect sur ${sessionDataMock.spName}`,
        to: [
          {
            email: spIdentityMock.email,
            name: `${spIdentityMock.given_name} ${spIdentityMock.family_name}`,
          },
        ],
      };
      configServiceMock.get.mockReturnValueOnce({ from: fromMock });

      // action
      await service.sendAuthenticationMail(reqMock);

      // expect
      expect(mailerServiceMock.send).toBeCalledTimes(1);
      expect(mailerServiceMock.send).toBeCalledWith(expectedEmailParams);
    });
  });
});
