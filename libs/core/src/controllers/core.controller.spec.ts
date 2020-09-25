import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { CoreController } from './core.controller';
import { CoreService } from '../services';
import { CoreMissingIdentity, CoreInvalidCsrfException } from '../exceptions';

describe('CoreController', () => {
  let coreController: CoreController;

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
      controllers: [CoreController],
      providers: [
        LoggerService,
        OidcProviderService,
        CoreService,
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
      .overrideProvider(CoreService)
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

    coreController = await app.get<CoreController>(CoreController);

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
    serviceProviderServiceMock.getById.mockResolvedValue({ name: spNameMock });
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
    it('should redirect to /consent URL', async () => {
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
      expect(res.redirect).toHaveBeenCalledWith(
        `/api/v2/interaction/${req.fc.interactionId}/consent`,
      );
    });
  });

  describe('getConsent', () => {
    it('should get data from session', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      await coreController.getConsent(reqMock, resMock, params);
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenCalledWith(interactionIdMock);
    });

    it('should get data from interaction with oidc provider', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      await coreController.getConsent(reqMock, resMock, params);
      // Then
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledTimes(1);
      expect(oidcProviderServiceMock.getInteraction).toHaveBeenCalledWith(
        reqMock,
        resMock,
      );
    });

    it('should return data from session for interactionId', async () => {
      // Given
      const reqMock = {
        fc: { interactionId: interactionIdMock },
      };
      const resMock = {};

      // When
      const result = await coreController.getConsent(reqMock, resMock, params);
      // Then
      expect(result).toEqual({
        csrfToken: 'randomStringMockValue',
        interactionId: interactionIdMock,
        identity: {},
        scopes: ['toto', 'titi'],
        spName: spNameMock,
      });
    });
  });

  describe('getLogin', () => {
    it('should throw an exception if no identity in session', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      sessionServiceMock.get.mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
        csrfToken: randomStringMock,
      });
      // Then
      expect(coreController.getLogin(req, res, body, params)).rejects.toThrow(
        CoreMissingIdentity,
      );
    });
    it('should throw an exception if csrf not match with csrfToken in session', async () => {
      // Given
      const body = { _csrf: 'csrfNotMatchingCsrfTokenInSession' };
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // Then
      expect(coreController.getLogin(req, res, body, params)).rejects.toThrow(
        CoreInvalidCsrfException,
      );
    });
    it('should send an email notification to the end user by calling core.sendAuthenticationMail', async () => {
      // setup
      const body = { _csrf: randomStringMock };
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};

      // action
      await coreController.getLogin(req, res, body, params);

      // expect
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledTimes(1);
      expect(coreServiceMock.sendAuthenticationMail).toBeCalledWith(req);
    });

    it('should call interactionFinished', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      await coreController.getLogin(req, res, body, params);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
        expect.objectContaining({
          login: {
            account: interactionIdMock,
            acr: acrMock,
            ts: expect.any(Number),
          },
          consent: {
            rejectedScopes: [],
            rejectedClaims: [],
          },
        }),
      );
    });
    it('should return an object', async () => {
      // Given
      const body = { _csrf: randomStringMock };
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      const result = await coreController.getLogin(req, res, body, params);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });

  describe('generateAndStoreCsrf', () => {
    it('should return the csrfToken', async () => {
      // Given
      const interactionId = '123';
      // When
      const result = await coreController['generateAndStoreCsrf'](
        interactionId,
      );
      // Then
      expect(result).toBe('randomStringMockValue');
    });
    it('should patch the sessions', async () => {
      // Given
      const interactionId = '123';
      // When
      await coreController['generateAndStoreCsrf'](interactionId);
      // Then
      expect(sessionServiceMock.patch).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.patch).toHaveBeenCalledWith('123', {
        csrfToken: 'randomStringMockValue',
      });
    });
  });
});
