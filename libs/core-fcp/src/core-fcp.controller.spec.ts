import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { ServiceProviderService } from '@fc/service-provider';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

describe('CoreFcpController', () => {
  let coreFcpController: CoreFcpController;

  const interactionDetailsResolved = {
    uid: Symbol('uid'),
    prompt: Symbol('prompt'),
    params: {},
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
    store: jest.fn(),
    get: jest.fn(),
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
      .compile();

    coreFcpController = await app.get<CoreFcpController>(CoreFcpController);

    jest.resetAllMocks();
    providerMock.interactionDetails.mockResolvedValue(
      interactionDetailsResolved,
    );
    oidcProviderServiceMock.finishInteraction.mockReturnValue(
      interactionFinishedValue,
    );
    oidcProviderServiceMock.getInteraction.mockReturnValue(providerMock);
    coreFcpServiceMock.verify.mockResolvedValue(interactionDetailsResolved);
    serviceProviderServiceMock.getById.mockResolvedValue({ name: 'some SP' });
    sessionServiceMock.get.mockResolvedValue({
      interactionId: '42',
      spIdentity: {},
    });
  });

  describe('getInteraction', () => {
    it('should return uid', async () => {
      // Given
      const req = {
        interactionId: 42,
      };
      const res = {};
      oidcProviderServiceMock.getInteraction.mockResolvedValue({
        uid: 'uid',
        prompt: 'prompt',
        params: 'params',
      });
      // When
      const result = await coreFcpController.getInteraction(req, res);
      // Then
      expect(result).toHaveProperty('uid');
    });
  });

  describe('getVerify', () => {
    it('should call coreFcpService', async () => {
      // Given
      const req = {
        interactionId: 42,
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreFcpController.getVerify(req, res);
      // Then
      expect(coreFcpServiceMock.verify).toHaveBeenCalledTimes(1);
    });
    it('should redirect to /consent URL', async () => {
      // Given
      const req = {
        interactionId: 42,
      };
      const res = {
        redirect: jest.fn(),
      };
      // When
      await coreFcpController.getVerify(req, res);
      // Then
      expect(res.redirect).toHaveBeenCalledTimes(1);
      expect(res.redirect).toHaveBeenCalledWith(
        `/interaction/${req.interactionId}/consent`,
      );
    });
  });

  describe('getConsent', () => {
    it('should get data from session for interactionId', async () => {
      // Given
      const reqMock = {
        interactionId: '42',
      };
      // When
      await coreFcpController.getConsent(reqMock);
      // Then
      expect(sessionServiceMock.get).toHaveBeenCalledTimes(1);
      expect(sessionServiceMock.get).toHaveBeenCalledWith('42');
    });
    it('should return data from session for interactionId', async () => {
      // Given
      const reqMock = {
        interactionId: '42',
      };
      // When
      const result = await coreFcpController.getConsent(reqMock);
      // Then
      expect(result).toEqual({
        interactionId: '42',
        identity: {},
      });
    });
  });

  describe('getLogin', () => {
    it('should send an email notification to the end user by calling coreFcp.sendAuthenticationMail', async () => {
      // setup
      const req = {
        body: {},
      };
      const res = {};
      const body = {};

      // action
      await coreFcpController.getLogin(req, res, body);

      // expect
      expect(coreFcpServiceMock.sendAuthenticationMail).toBeCalledTimes(1);
      expect(coreFcpServiceMock.sendAuthenticationMail).toBeCalledWith(req);
    });

    it('should call interactionFinished', async () => {
      // Given
      const req = {
        session: { uid: 42 },
        body: { acr: 'acr' },
      };
      const res = {};
      const body = { acr: 'foo' };
      // When
      await coreFcpController.getLogin(req, res, body);
      // Then
      expect(oidcProviderServiceMock.finishInteraction).toHaveBeenCalledTimes(
        1,
      );
    });
    it('should return an object', async () => {
      // Given
      const req = {
        session: { uid: 42 },
        body: { acr: 'acr' },
      };
      const res = {};
      const body = { acr: 'foo' };
      // When
      const result = await coreFcpController.getLogin(req, res, body);
      // Then
      expect(result).toBe(interactionFinishedValue);
    });
  });
});
