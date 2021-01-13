import { ModuleRef } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CoreService } from '@fc/core';
import { ConfigService } from '@fc/config';
import { MailerService } from '@fc/mailer';
import { FeatureHandler } from '@fc/feature-handler';
import { IdentityProviderService } from '@fc/identity-provider';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpService', () => {
  let service: CoreFcpService;

  const loggerServiceMock = {
    setContext: jest.fn(),
    debug: jest.fn(),
    warn: jest.fn(),
  };

  const uidMock = '42';

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  };

  const spIdentityMock = {
    // oidc parameter
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

  const storeInteractionMock = { spInteraction: {} };

  const mailerServiceMock = {
    send: jest.fn(),
  };

  const featureHandlerMock = jest.spyOn(FeatureHandler, 'get');

  const featureHandlerServiceMock = {
    handle: jest.fn(),
  };

  const moduleRefMock = {
    get: jest.fn(),
  };

  const IdentityProviderMock = {
    getById: jest.fn(),
  };

  const coreVerifyMock = 'core-fcp-default-verify';

  const IdentityProviderResultMock = {
    featureHandlers: { coreVerify: coreVerifyMock },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConfigService,
        CoreService,
        CoreFcpService,
        LoggerService,
        SessionService,
        IdentityProviderService,
        MailerService,
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
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(IdentityProviderMock)
      .overrideProvider(ModuleRef)
      .useValue(moduleRefMock)
      .compile();

    service = module.get<CoreFcpService>(CoreFcpService);

    jest.resetAllMocks();

    sessionServiceMock.get.mockResolvedValue(sessionDataMock);
    coreServiceMock.storeInteraction.mockResolvedValue(storeInteractionMock);
    featureHandlerMock.mockResolvedValueOnce(featureHandlerServiceMock);
    IdentityProviderMock.getById.mockResolvedValue(IdentityProviderResultMock);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('verify', () => {
    it('Should call session.get() with `interactionId`', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(sessionServiceMock.get).toBeCalledTimes(1);
      expect(sessionServiceMock.get).toBeCalledWith(uidMock);
    });

    it('Should call `FeatureHandler.get()` to get instantiated featureHandler class', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(featureHandlerMock).toBeCalledTimes(1);
      expect(featureHandlerMock).toBeCalledWith(coreVerifyMock, service);
    });

    it('Should call featureHandle.handle() with `req`', async () => {
      // Given
      // When
      await service.verify(reqMock);
      // Then
      expect(featureHandlerServiceMock.handle).toBeCalledTimes(1);
      expect(featureHandlerServiceMock.handle).toBeCalledWith(reqMock);
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
      await result;
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
