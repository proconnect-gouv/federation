import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { CoreMissingIdentity } from '@fc/core';
import { CoreFcaController } from './core-fca.controller';
import { CoreFcaService } from './core-fca.service';

describe('CoreFcaController', () => {
  let coreController: CoreFcaController;

  const params = { uid: 'abcdefghijklmnopqrstuvwxyz0123456789' };
  const interactionIdMock = 'interactionIdMockValue';
  const acrMock = 'acrMockValue';
  const spNameMock = 'some SP';

  const interactionDetailsResolved = {
    uid: Symbol('uid'),
    prompt: Symbol('prompt'),
    params: {
      scope: 'toto titi',
    },
  };
  const interactionFinishedValue = Symbol('interactionFinishedValue');
  const providerMock = {
    interactionDetails: jest.fn(),
    interactionFinished: jest.fn(),
  };

  const oidcProviderServiceMock = {
    getInteraction: jest.fn(),
    finishInteraction: jest.fn(),
  };

  const loggerServiceMock = ({
    setContext: jest.fn(),
    debug: jest.fn(),
    trace: jest.fn(),
  } as unknown) as LoggerService;

  const coreServiceMock = {
    getConsent: jest.fn(),
    sendAuthenticationMail: jest.fn(),
    verify: jest.fn(),
  };

  const identityProviderServiceMock = {
    getList: jest.fn(),
  };

  const serviceProviderServiceMock = {
    getById: jest.fn(),
  };

  const sessionServiceMock = {
    get: jest.fn(),
    patch: jest.fn(),
  };

  const randomStringMock = 'randomStringMockValue';
  const cryptographyServiceMock = {
    genRandomString: jest.fn(),
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcaController],
      providers: [
        LoggerService,
        OidcProviderService,
        CoreFcaService,
        IdentityProviderService,
        ServiceProviderService,
        SessionService,
        ConfigService,
        CryptographyService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CryptographyService)
      .useValue(cryptographyServiceMock)
      .compile();

    coreController = await app.get<CoreFcaController>(CoreFcaController);

    jest.resetAllMocks();
    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockResolvedValue(
      interactionDetailsResolved,
    );
    coreServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    serviceProviderServiceMock.getById.mockResolvedValue({
      name: spNameMock,
    });
    sessionServiceMock.get.mockResolvedValue({
      interactionId: interactionIdMock,
      spAcr: acrMock,
      spIdentity: {},
      spName: spNameMock,
      csrfToken: randomStringMock,
    });
    sessionServiceMock.patch.mockResolvedValueOnce(undefined);
    cryptographyServiceMock.genRandomString.mockReturnValue(randomStringMock);
    configServiceMock.get.mockReturnValue(appConfigMock);
  });

  describe('getDefault', () => {
    it('should redirect to configured url', () => {
      // Given
      const configuredValueMock = 'fooBar';
      configServiceMock.get.mockReturnValue({
        defaultRedirectUri: configuredValueMock,
      });
      const resMock = {
        redirect: jest.fn(),
      };
      // When
      coreController.getDefault(resMock);
      // Then
      expect(configServiceMock.get).toHaveBeenCalledTimes(1);
      expect(configServiceMock.get).toHaveBeenCalledWith('Core');
      expect(resMock.redirect).toHaveBeenCalledTimes(1);
      expect(resMock.redirect).toHaveBeenCalledWith(301, configuredValueMock);
    });
  });

  describe('getInteraction', () => {
    it('should return uid', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreController.getInteraction(req, res, params);
      // Then
      expect(result).toHaveProperty('uid');
    });
  });

  describe('getVerify', () => {
    it('should call coreService', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(coreServiceMock.verify).toHaveBeenCalledTimes(1);
    });
    it('should redirect to /login URL', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreController.getVerify(req, res, params);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(`/api/v2/login`);
    });
  });

  describe('getLogin', () => {
    it('should throw an exception if no identity in session', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const next = jest.fn();
      sessionServiceMock.get.mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      expect(coreController.getLogin(req, next)).rejects.toThrow(
        CoreMissingIdentity,
      );
    });

    it('should call next', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      await coreController.getLogin(req, res);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
      );
    });
    it('should return result from controller.oidcProvider.finishInteraction()', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      const result = await coreController.getLogin(req, res);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });
});
