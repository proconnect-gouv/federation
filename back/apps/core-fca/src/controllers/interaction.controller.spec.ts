import { validate } from 'class-validator';
import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { ConfigService } from '@fc/config';
import { CoreIdpHintException } from '@fc/core';
import { CsrfService } from '@fc/csrf';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { NotificationsService } from '@fc/notifications';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { ISessionService, SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

// --- Mocks for external dependencies ---
import { UserSession } from '../dto';
import {
  CoreAcrNotSatisfiedException,
  CoreFcaAgentNotFromPublicServiceException,
  CoreLoginRequiredException,
} from '../exceptions';
import { CoreFcaFqdnService, CoreFcaService } from '../services';
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
  let fqdnServiceMock: any;
  let trackingMock: any;
  let sessionServiceMock: any; // for Csrf only
  let coreFcaMock: any;
  let csrfServiceMock: any;

  beforeEach(async () => {
    oidcProviderMock = {
      getInteraction: jest.fn(),
      finishInteraction: jest.fn(),
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
    fqdnServiceMock = {
      getFqdnFromEmail: jest.fn(),
    };
    trackingMock = {
      track: jest.fn(),
      TrackedEventsMap: {
        FC_AUTHORIZE_INITIATED: 'EVENT_AUTHORIZE_INITIATED',
        FC_SSO_INITIATED: 'EVENT_SSO_INITIATED',
        FC_REDIRECTED_TO_HINTED_IDP: 'EVENT_REDIRECTED_TO_HINTED_IDP',
        FC_SHOWED_IDP_CHOICE: 'EVENT_SHOWED_IDP_CHOICE',
      },
    };
    sessionServiceMock = {
      set: jest.fn(), // used by Csrf part
    };
    coreFcaMock = {
      redirectToIdp: jest.fn(),
    };
    csrfServiceMock = {
      renew: jest.fn(),
    };

    // Create the testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionController],
      providers: [
        OidcProviderService,
        IdentityProviderAdapterMongoService,
        ServiceProviderAdapterMongoService,
        ConfigService,
        CoreFcaService,
        CoreFcaFqdnService,
        CsrfService,
        TrackingService,
        OidcAcrService,
        SessionService,
        NotificationsService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderMock)
      .overrideProvider(OidcAcrService)
      .useValue(oidcAcrMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderMock)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(fqdnServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CsrfService)
      .useValue(csrfServiceMock)
      .overrideProvider(TrackingService)
      .useValue(trackingMock)
      .overrideProvider(ServiceProviderAdapterMongoService)
      .useValue(serviceProviderMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .overrideProvider(NotificationsService)
      .useValue(notificationsMock)
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

      expect(configServiceMock.get).toHaveBeenCalledWith('Core');
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

    it('should duplicate user session if session is active and valid', async () => {
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

      expect(userSessionService.duplicate).toHaveBeenCalled();
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

    it('should call redirectToIdp when a valid IdP hint exists', async () => {
      const req = { sessionId: 'session1' } as unknown as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({}),
        duplicate: jest.fn(),
        set: jest.fn(),
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
      expect(coreFcaMock.redirectToIdp).toHaveBeenCalledWith(
        req,
        res,
        'idp123',
      );
    });

    it('should throw CoreIdpHintException for invalid IdP hints', async () => {
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

      await expect(
        controller.getInteraction(
          req,
          res as Response,
          {} as any,
          userSessionService,
        ),
      ).rejects.toThrow(CoreIdpHintException);
    });

    it('should render the interaction page if no IdP hint is provided', async () => {
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
        params: { client_id: 'sp123', login_hint: 'user@example.com' },
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
        loginHint: 'user@example.com',
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
      } as unknown as ISessionService<UserSession>;
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

    it('should throw CoreLoginRequiredException when IdP is inactive and in silent authentication mode', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          isSilentAuthentication: true,
          idpId: 'idp123',
        }),
      } as unknown as ISessionService<UserSession>;

      identityProviderMock.isActiveById.mockResolvedValue(false);

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(CoreLoginRequiredException);
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
      } as unknown as ISessionService<UserSession>;

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
      } as unknown as ISessionService<UserSession>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: 'public' });

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(CoreFcaAgentNotFromPublicServiceException);
    });

    it('should throw CoreAcrNotSatisfiedException when interactionAcr is not satisfied', async () => {
      const req = {} as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spEssentialAcr: 'high',
          idpAcr: 'low',
        }),
      } as unknown as ISessionService<UserSession>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: 'public' });
      oidcAcrMock.getInteractionAcr.mockReturnValue(null);

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(CoreAcrNotSatisfiedException);
    });
  });
});
