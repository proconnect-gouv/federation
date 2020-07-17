import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from '../services';
import { CoreFcpMissingIdentity } from '../exceptions';

describe('CoreFcpController', () => {
  let coreFcpController: CoreFcpController;

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

  const coreFcpServiceMock = {
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
  };

  const appConfigMock = {
    urlPrefix: '/api/v2',
  };
  const configServiceMock = {
    get: () => appConfigMock,
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [CoreFcpController],
      providers: [
        LoggerService,
        OidcProviderService,
        CoreFcpService,
        IdentityProviderService,
        ServiceProviderService,
        SessionService,
        ConfigService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(CoreFcpService)
      .useValue(coreFcpServiceMock)
      .overrideProvider(IdentityProviderService)
      .useValue(identityProviderServiceMock)
      .overrideProvider(ServiceProviderService)
      .useValue(serviceProviderServiceMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .compile();

    coreFcpController = await app.get<CoreFcpController>(CoreFcpController);

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
    coreFcpServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    serviceProviderServiceMock.getById.mockResolvedValue({ name: spNameMock });
    sessionServiceMock.get.mockResolvedValue({
      interactionId: interactionIdMock,
      spAcr: acrMock,
      spIdentity: {},
      spName: spNameMock,
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
      const result = await coreFcpController.getInteraction(req, res, params);
      // Then
      expect(result).toHaveProperty('uid');
    });
  });

  describe('getVerify', () => {
    it('should call coreFcpService', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreFcpController.getVerify(req, res, params);
      // Then
      expect(coreFcpServiceMock.verify).toHaveBeenCalledTimes(1);
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
      await coreFcpController.getVerify(req, res, params);
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
      await coreFcpController.getConsent(reqMock, resMock, params);
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
      await coreFcpController.getConsent(reqMock, resMock, params);
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
      const result = await coreFcpController.getConsent(
        reqMock,
        resMock,
        params,
      );
      // Then
      expect(result).toEqual({
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
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      sessionServiceMock.get.mockResolvedValue({
        interactionId: interactionIdMock,
        spAcr: acrMock,
        spName: spNameMock,
      });
      // Then
      expect(coreFcpController.getLogin(req, res, params)).rejects.toThrow(
        CoreFcpMissingIdentity,
      );
    });
    it('should send an email notification to the end user by calling coreFcp.sendAuthenticationMail', async () => {
      // setup
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};

      // action
      await coreFcpController.getLogin(req, res, params);

      // expect
      expect(coreFcpServiceMock.sendAuthenticationMail).toBeCalledTimes(1);
      expect(coreFcpServiceMock.sendAuthenticationMail).toBeCalledWith(req);
    });

    it('should call interactionFinished', async () => {
      // Given
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      await coreFcpController.getLogin(req, res, params);
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
      const req = {
        fc: { interactionId: interactionIdMock },
      };
      const res = {};
      // When
      const result = await coreFcpController.getLogin(req, res, params);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });
});
