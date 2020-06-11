import { Test, TestingModule } from '@nestjs/testing';
import { EventBus } from '@nestjs/cqrs';
import { LoggerService } from '@fc/logger';
import { ConfigService } from '@fc/config';
import { OidcProviderService, OidcCtx } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import {
  RnippService,
  RnippRequestEvent,
  RnippReceivedValidEvent,
  RnippDeceasedException,
  RnippReceivedDeceasedEvent,
  RnippNotFoundMultipleEchoException,
  RnippReceivedInvalidEvent,
  RnippNotFoundNoEchoException,
  RnippNotFoundSingleEchoException,
  RnippFoundOnlyWithMaritalNameException,
} from '@fc/rnipp';
import { CryptographyService } from '@fc/cryptography';
import { AccountService, AccountBlockedException } from '@fc/account';

import {
  CoreFcpLowAcrException,
  CoreFcpInvalidAcrException,
} from './exceptions';
import { CoreFcpService } from './core-fcp.service';
import { MailerService } from '@fc/mailer';

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

  const uidMock = 42;

  const getInteractionResultMock = {
    prompt: {},

    params: {
      // oidc param
      // eslint-disable-next-line @typescript-eslint/camelcase
      acr_values: 'eidas3',
      // eslint-disable-next-line @typescript-eslint/camelcase
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
    store: jest.fn(),
    delete: jest.fn(),
  };

  const accountServiceMock = {
    storeInteraction: jest.fn(),
    isBlocked: jest.fn(),
  };

  const rnippServiceMock = {
    check: jest.fn(),
  };

  const identityMock = {
    // eslint-disable-next-line @typescript-eslint/camelcase
    given_name: 'Edward',
    // eslint-disable-next-line @typescript-eslint/camelcase
    family_name: 'TEACH',
    email: 'eteach@fqdn.ext',
  };

  const cryptographyServiceMock = {
    computeIdentityHash: jest.fn(),
    computeSubV2: jest.fn(),
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const reqMock = {
    interactionId: uidMock,
    ip: '123.123.123.123',
  };

  const eventBusMock = {
    publish: jest.fn(),
  };

  const sessionDataMock = {
    spIdentity: identityMock,
    idpId: '42',
    idpAcr: 'eidas3',
    idpName: 'my favorite Idp',
    spId: 'sp_id',
    spAcr: 'eidas3',
    spName: 'my great SP',
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
        EventBus,
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
      .overrideProvider(EventBus)
      .useValue(eventBusMock)
      .compile();

    service = module.get<CoreFcpService>(CoreFcpService);

    jest.resetAllMocks();

    getInteractionMock.mockResolvedValue(getInteractionResultMock);

    sessionServiceMock.get.mockResolvedValue(sessionDataMock);

    rnippServiceMock.check.mockResolvedValue(identityMock);
    accountServiceMock.isBlocked.mockResolvedValue(false);
    configServiceMock.get.mockReturnValue({
      forcedPrompt: ['testprompt'],
      configuration: { routes: { authorization: '/foo' } },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('onModuleInit', () => {
    it('should register ovrrideAuthorizePrompt middleware', () => {
      // Given
      service['overrideAuthorizePrompt'] = jest.fn();
      // When
      service.onModuleInit();
      // Then
      expect(oidcProviderServiceMock.registerMiddleware).toHaveBeenCalledTimes(
        1,
      );
      expect(service['overrideAuthorizePrompt']).toHaveBeenCalledTimes(0);
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
      const ctxMock = {
        method: 'POST',
        body: {},
      } as OidcCtx;
      const overridePrompt = 'test';
      // When
      service['overrideAuthorizePrompt'](overridePrompt, ctxMock);
      // Then
      expect(ctxMock.body.prompt).toBe(overridePrompt);
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

  describe('verify', () => {
    it('Should not throw if verified', async () => {
      // Then
      expect(service.verify(reqMock)).resolves.not.toThrow();
    });

    // Dependencies sevices errors
    it('Should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error 1');
      service['checkIfAcrIsValid'] = jest.fn().mockImplementationOnce(() => {
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
      sessionServiceMock.store.mockRejectedValueOnce(errorMock);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    it('should throw if account is blocked', () => {
      // Given
      accountServiceMock.isBlocked.mockResolvedValue(true);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(AccountBlockedException);
    });

    it('should throw if account blocked check fails', () => {
      // Given
      const error = new Error('foo');
      accountServiceMock.isBlocked.mockRejectedValueOnce(error);
      // Then
      expect(service.verify(reqMock)).rejects.toThrow(error);
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

  describe('rnippCheck', () => {
    it('should not throw if rnipp service does not', async () => {
      // Then
      expect(
        service['rnippCheck'](identityMock, reqMock),
      ).resolves.not.toThrow();
    });

    it('should return rnippIdentity', async () => {
      // When
      const result = await service['rnippCheck'](identityMock, reqMock);
      // Then
      expect(result).toBe(identityMock);
    });

    it('should publish events when searching', async () => {
      // When
      await service['rnippCheck'](identityMock, reqMock);
      // Then
      expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.any(RnippRequestEvent),
      );
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.any(RnippReceivedValidEvent),
      );
    });

    it('should add interactionId and Ip address properties in published events', async () => {
      // Given
      const expectedEventStruct = {
        properties: {
          interactionId: 42,
          ip: '123.123.123.123',
        },
      };
      // When
      await service['rnippCheck'](identityMock, reqMock);
      // Then
      expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.any(RnippRequestEvent),
      );
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.objectContaining(expectedEventStruct),
      );
    });

    it('should throw and publish deceased event if rnipp throws "desceased" exception', async () => {
      // Given
      rnippServiceMock.check.mockImplementationOnce(() => {
        throw new RnippDeceasedException();
      });
      // When
      try {
        await service['rnippCheck'](identityMock, reqMock);
      } catch (error) {
        // Then
        expect(error).toBeInstanceOf(RnippDeceasedException);

        expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippRequestEvent),
        );
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippReceivedDeceasedEvent),
        );
      }
    });

    it('should throw and publish Invalid event if rnipp throws "not found multiple echo" exception', async () => {
      // Given
      rnippServiceMock.check.mockImplementationOnce(() => {
        throw new RnippNotFoundMultipleEchoException();
      });
      // When
      try {
        await service['rnippCheck'](identityMock, reqMock);
      } catch (error) {
        // Then
        expect(error).toBeInstanceOf(RnippNotFoundMultipleEchoException);

        expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippRequestEvent),
        );
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippReceivedInvalidEvent),
        );
      }
    });

    it('should throw and publish Invalid event if rnipp throws "not found no echo" exception', async () => {
      // Given
      rnippServiceMock.check.mockImplementationOnce(() => {
        throw new RnippNotFoundNoEchoException();
      });
      // When
      try {
        await service['rnippCheck'](identityMock, reqMock);
      } catch (error) {
        // Then
        expect(error).toBeInstanceOf(RnippNotFoundNoEchoException);

        expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippRequestEvent),
        );
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippReceivedInvalidEvent),
        );
      }
    });

    it('should throw and publish Invalid event if rnipp throws "not found single echo" exception', async () => {
      // Given
      rnippServiceMock.check.mockImplementationOnce(() => {
        throw new RnippNotFoundSingleEchoException();
      });
      // When
      try {
        await service['rnippCheck'](identityMock, reqMock);
      } catch (error) {
        // Then
        expect(error).toBeInstanceOf(RnippNotFoundSingleEchoException);

        expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippRequestEvent),
        );
        expect(eventBusMock.publish).toHaveBeenCalledWith(
          expect.any(RnippReceivedInvalidEvent),
        );
      }
    });
  });

  it('should throw and publish Invalid event if rnipp throws "not found only marital" exception', async () => {
    // Given
    rnippServiceMock.check.mockImplementationOnce(() => {
      throw new RnippFoundOnlyWithMaritalNameException();
    });
    // When
    try {
      await service['rnippCheck'](identityMock, reqMock);
    } catch (error) {
      // Then
      expect(error).toBeInstanceOf(RnippFoundOnlyWithMaritalNameException);

      expect(eventBusMock.publish).toHaveBeenCalledTimes(2);
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.any(RnippRequestEvent),
      );
      expect(eventBusMock.publish).toHaveBeenCalledWith(
        expect.any(RnippReceivedInvalidEvent),
      );
    }
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

  describe('sendAuthenticationMail', () => {
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
      expect(sessionServiceMock.get).toBeCalledWith(reqMock.interactionId);
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
            email: identityMock.email,
            name: `${identityMock.given_name} ${identityMock.family_name}`,
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
