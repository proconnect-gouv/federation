import { validate } from 'class-validator';
import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CsrfService } from '@fc/csrf';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { NotificationsService } from '@fc/notifications';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';

import { getLoggerMock } from '@mocks/logger';

// --- Mocks for external dependencies ---
import { AfterGetOidcCallbackSessionDto, UserSession } from '../dto';
import { CoreFcaAgentNotFromPublicServiceException } from '../exceptions';
import { CoreFcaControllerService } from '../services';
import { InteractionController } from './interaction.controller';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-mock'),
}));

jest.mock('class-validator', () => ({
  ...jest.requireActual('class-validator'),
  validate: jest.fn(),
}));

describe('InteractionController', () => {
  let controller: InteractionController;

  // Mocks for all dependencies injected in the constructor:
  let oidcProviderMock: any;
  let identityProviderMock: any;
  let oidcAcrMock: any;
  let serviceProviderMock: any;
  let configServiceMock: any;
  let notificationsMock: any;
  let sessionServiceMock: any; // for Csrf only
  let coreFcaControllerMock: any;
  let csrfServiceMock: any;
  let loggerMock: any;

  beforeEach(async () => {
    oidcProviderMock = {
      getInteraction: jest.fn(),
      finishInteraction: jest.fn(),
      abortInteraction: jest.fn(),
    };
    identityProviderMock = {
      getById: jest.fn(),
      isActiveById: jest.fn(),
    };
    oidcAcrMock = {
      getFilteredAcrParamsFromInteraction: jest.fn(),
      getInteractionAcr: jest.fn(),
      isEssentialAcrSatisfied: jest.fn(),
    };
    serviceProviderMock = {
      getById: jest.fn(),
    };
    configServiceMock = {
      get: jest.fn(),
    };
    notificationsMock = {
      getNotificationToDisplay: jest.fn(),
    };
    sessionServiceMock = {
      set: jest.fn(), // used by Csrf part
    };
    coreFcaControllerMock = {
      redirectToIdpWithEmail: jest.fn(),
      redirectToIdpWithIdpId: jest.fn(),
    };
    csrfServiceMock = {
      renew: jest.fn(),
    };
    loggerMock = getLoggerMock();

    // Create the testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionController],
      providers: [
        OidcProviderService,
        IdentityProviderAdapterMongoService,
        ServiceProviderAdapterMongoService,
        ConfigService,
        CoreFcaControllerService,
        CsrfService,
        OidcAcrService,
        SessionService,
        NotificationsService,
        LoggerService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderMock)
      .overrideProvider(CoreFcaControllerService)
      .useValue(coreFcaControllerMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CsrfService)
      .useValue(csrfServiceMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .compile();

    controller = module.get<InteractionController>(InteractionController);
    jest.clearAllMocks();
    (validate as jest.Mock).mockReset();
  });

  describe('getDefault()', () => {
    it('should redirect to the configured defaultRedirectUri', () => {
      const res: Partial<Response> = { redirect: jest.fn() };
      configServiceMock.get.mockReturnValue({
        defaultRedirectUri: 'http://default-uri',
      });

      controller.getDefault(res as Response);

      expect(configServiceMock.get).toHaveBeenCalledWith('App');
      expect(res.redirect).toHaveBeenCalledWith(301, 'http://default-uri');
    });
  });

  describe('getInteraction()', () => {
    beforeEach(() => {
      serviceProviderMock.getById.mockResolvedValue({ name: 'spName' });
      oidcAcrMock.getFilteredAcrParamsFromInteraction.mockReturnValue({
        acr_values: 'high',
      });
      oidcAcrMock.isEssentialAcrSatisfied.mockReturnValue(true);
      configServiceMock.get.mockReturnValue({ urlPrefix: '/prefix' });
    });

    it('should reset user session if there is no active session', async () => {
      const req = {} as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({}),
        reset: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      const interaction = {
        uid: 'interaction123',
        params: { client_id: 'sp123', login_hint: 'hint@example.com' },
      };
      oidcProviderMock.getInteraction.mockResolvedValue(interaction);
      (validate as jest.Mock).mockReturnValue([
        new Error('not a valid session'),
      ]);

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(userSessionService.reset).toHaveBeenCalled();
      expect(userSessionService.set).toHaveBeenCalledWith({
        browsingSessionId: 'uuid-mock',
      });
    });

    it('should reset user session if login_hint is different from the email in the current session', async () => {
      const req = {} as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockImplementation((key) => {
          if (key) {
            if (key === 'idpIdentity') {
              return { email: 'current@example.com' };
            }
            return undefined;
          }
          return {
            interactionId: 'interaction123',
            idpIdentity: { email: 'current@example.com' },
          };
        }),
        reset: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123', login_hint: 'different@example.com' },
      });
      (validate as jest.Mock).mockReturnValue([]);

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(userSessionService.reset).toHaveBeenCalled();
    });

    it('should redirect to INTERACTION_VERIFY when session is reused', async () => {
      const req = {} as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({ interactionId: 'interaction123' }),
        duplicate: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123' },
      });

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(res.redirect).toHaveBeenCalledWith(
        '/prefix/interaction/interaction123/verify',
      );
    });

    it('should call redirectToIdpWithIdpId when a valid IdP hint exists', async () => {
      const req = { sessionId: 'session1' } as unknown as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({}),
        duplicate: jest.fn(),
        set: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123', idp_hint: 'idp123' },
      });
      identityProviderMock.getById.mockResolvedValue({ id: 'idp123' });

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(identityProviderMock.getById).toHaveBeenCalledWith('idp123');
      expect(coreFcaControllerMock.redirectToIdpWithIdpId).toHaveBeenCalledWith(
        req,
        res,
        'idp123',
      );
    });

    it('should call abort interaction for invalid IdP hints', async () => {
      const req = {} as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn(),
        duplicate: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123', idp_hint: 'unknown-idp' },
      });
      identityProviderMock.getById.mockResolvedValue(null);

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(oidcProviderMock.abortInteraction).toHaveBeenCalled();
    });

    it('should call redirectToIdpWithEmail when login_hint is provided', async () => {
      const req = { sessionId: 'session1' } as unknown as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({}),
        duplicate: jest.fn(),
        set: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123', login_hint: 'login123' },
      });
      identityProviderMock.getById.mockResolvedValue({ id: 'idp123' });

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(coreFcaControllerMock.redirectToIdpWithEmail).toHaveBeenCalledWith(
        req,
        res,
        'login123',
        false,
      );
    });

    it('should render the interaction page if no hints are provided', async () => {
      const req = {} as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({}),
        set: jest.fn(),
        reset: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<UserSession>;
      notificationsMock.getNotificationToDisplay.mockResolvedValue({
        message: 'notification',
      });
      configServiceMock.get.mockReturnValue({ defaultEmailRenater: 'email' });
      oidcProviderMock.getInteraction.mockResolvedValue({
        uid: 'interaction123',
        params: { client_id: 'sp123' },
      });
      csrfServiceMock.renew.mockReturnValue('csrfToken');
      (validate as jest.Mock).mockReturnValue([
        new Error('not a valid session'),
      ]);

      await controller.getInteraction(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(res.render).toHaveBeenCalledWith('interaction', {
        csrfToken: 'csrfToken',
        defaultEmailRenater: 'email',
        notificationMessage: 'notification',
        spName: 'spName',
      });
    });
  });

  describe('getVerify()', () => {
    it('should successfully complete the interaction when the IdP is active and conditions are satisfied', async () => {
      const req = { sessionId: 'session1' } as unknown as Request;
      const res: Partial<Response> = { redirect: jest.fn() };
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          interactionId: 'interaction123',
          idpAcr: 'high',
          spEssentialAcr: 'high',
          spId: 'sp123',
          idpId: 'idp123',
          idpIdentity: { sub: 'user1', extraClaims: 'extra' },
        }),
        set: jest.fn(),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;
      const interactionAcr = 'high';

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: 'private' });
      oidcAcrMock.getInteractionAcr.mockReturnValue(interactionAcr);
      oidcProviderMock.finishInteraction.mockResolvedValue(undefined);
      configServiceMock.get.mockReturnValueOnce({
        configuration: { claims: ['sub'] },
      });

      await controller.getVerify(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(oidcAcrMock.getInteractionAcr).toHaveBeenCalledWith({
        idpAcr: 'high',
        spEssentialAcr: 'high',
      });
      expect(userSessionService.set).toHaveBeenCalledWith({
        interactionAcr,
      });
      expect(oidcProviderMock.finishInteraction).toHaveBeenCalledWith(
        req,
        res,
        {
          acr: interactionAcr,
        },
      );
    });

    it('should call abort interaction when IdP is inactive and in silent authentication mode', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          isSilentAuthentication: true,
          idpId: 'idp123',
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(false);

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(oidcProviderMock.abortInteraction).toHaveBeenCalled();
    });

    it('should redirect to INTERACTION route when IdP is inactive and not in silent authentication mode', async () => {
      const req = { sessionId: 'session1' } as unknown as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          isSilentAuthentication: false,
          interactionId: 'interaction123',
          idpId: 'idp123',
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(false);
      configServiceMock.get.mockReturnValueOnce({ urlPrefix: '/prefix' });

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(res.redirect).toHaveBeenCalledWith(
        '/prefix/interaction/interaction123',
      );
    });

    it('should throw CoreFcaAgentNotFromPublicServiceException for private sector identity not allowed by SP', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spId: 'sp123',
          idpId: 'idp123',
          idpIdentity: { is_service_public: false },
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: 'public' });

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(CoreFcaAgentNotFromPublicServiceException);
    });

    it('should call abort interaction when interactionAcr is not satisfied', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spEssentialAcr: 'high',
          idpAcr: 'low',
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: 'public' });
      oidcAcrMock.getInteractionAcr.mockReturnValue(null);

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(oidcProviderMock.abortInteraction).toHaveBeenCalled();
    });
  });
});
