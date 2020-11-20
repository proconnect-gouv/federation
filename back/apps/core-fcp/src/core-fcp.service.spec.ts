import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import {
  RnippService,
  RnippRequestedEvent,
  RnippReceivedValidEvent,
} from '@fc/rnipp';
import { AccountBlockedException } from '@fc/account';
import { TrackingService } from '@fc/tracking';
import { CoreService } from '@fc/core';
import { ConfigService } from '@fc/config';
import { MailerService } from '@fc/mailer';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpService', () => {
  let service: CoreFcpService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
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

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
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

  const reqMock = {
    fc: { interactionId: uidMock },
    ip: '123.123.123.123',
  };

  const configServiceMock = {
    get: jest.fn(),
  };

  const trackingMock = {
    track: jest.fn(),
  };

  const coreServiceMock = {
    checkIfAccountIsBlocked: jest.fn(),
    checkIfAcrIsValid: jest.fn(),
    storeInteraction: jest.fn(),
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

  const mailerServiceMock = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CoreService,
        CoreFcpService,
        LoggerService,
        SessionService,
        RnippService,
        MailerService,
        TrackingService,
      ],
    })
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CoreService)
      .useValue(coreServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(RnippService)
      .useValue(rnippServiceMock)
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .compile();

    service = module.get<CoreFcpService>(CoreFcpService);

    jest.resetAllMocks();

    getInteractionMock.mockResolvedValue(getInteractionResultMock);
    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    rnippServiceMock.check.mockResolvedValue(spIdentityMock);
    coreServiceMock.storeInteraction.mockResolvedValue({ spInteraction: {} });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify', () => {
    it('Should not throw if verified', async () => {
      // Then
      await expect(service.verify(reqMock)).resolves.not.toThrow();
    });

    it('Should throw if account is blocked', async () => {
      // Given
      const errorMock = new AccountBlockedException();
      coreServiceMock.checkIfAccountIsBlocked.mockRejectedValueOnce(errorMock);

      // Then
      await expect(service.verify(reqMock)).rejects.toThrow(errorMock);
    });

    // Dependencies sevices errors
    it('Should throw if acr is not validated', async () => {
      // Given
      const errorMock = new Error('my error 1');
      coreServiceMock.checkIfAcrIsValid.mockImplementation(() => {
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

    it('Should call interaction storage', async () => {
      // When
      await service.verify(reqMock);
      // Then
      expect(coreServiceMock.storeInteraction).toHaveBeenCalledTimes(1);
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
