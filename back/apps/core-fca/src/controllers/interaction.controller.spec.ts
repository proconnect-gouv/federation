import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { CoreIdpHintException, CoreRoutes, CoreVerifyService } from '@fc/core';
import { CsrfService } from '@fc/csrf';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { NotificationsService } from '@fc/notifications';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcProviderService } from '@fc/oidc-provider';
import { ServiceProviderAdapterMongoService } from '@fc/service-provider-adapter-mongo';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import {
  CoreFcaFqdnService,
  CoreFcaService,
  CoreFcaVerifyService,
} from '../services';
import { InteractionController } from './interaction.controller';
// --- Mocks for external dependencies ---

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'uuid-mock'),
}));

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('InteractionController', () => {
  let controller: InteractionController;

  // Mocks for all dependencies injected in the constructor:
  let oidcProviderMock: any;
  let identityProviderMock: any;
  let serviceProviderMock: any;
  let configServiceMock: any;
  let notificationsMock: any;
  let fqdnServiceMock: any;
  let coreFcaVerifyMock: any;
  let coreVerifyMock: any;
  let trackingMock: any;
  let sessionServiceMock: any; // for Csrf only
  let coreFcaMock: any;
  let csrfServiceMock: any;

  beforeEach(async () => {
    oidcProviderMock = {
      getInteraction: jest.fn(),
    };
    identityProviderMock = {
      getById: jest.fn(),
      isActiveById: jest.fn(),
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
    coreFcaVerifyMock = {
      handleErrorLoginRequired: jest.fn(),
      handleVerifyIdentity: jest.fn(),
    };
    coreVerifyMock = {
      handleUnavailableIdp: jest.fn(),
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
        CoreFcaVerifyService,
        CoreVerifyService,
        CsrfService,
        TrackingService,
        OidcAcrService,
        SessionService,
        NotificationsService,
      ],
    })
      .overrideProvider(OidcProviderService)
      .useValue(oidcProviderMock)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProviderMock)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(fqdnServiceMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaMock)
      .overrideProvider(CoreFcaVerifyService)
      .useValue(coreFcaVerifyMock)
      .overrideProvider(CoreVerifyService)
      .useValue(coreVerifyMock)
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
    (validateDto as jest.Mock).mockReset();
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
    // Create local mocks for req, res and the injected user session.
    const req: any = { sessionId: 'session1' };
    let res: Partial<Response>;
    let userSession: any; // this is the session passed by the UserSessionDecorator

    // Default interaction returned by oidcProvider.getInteraction
    const interactionData = {
      uid: 'interaction123',
      params: {
        acr_values: 'acr1',
        client_id: 'sp1',
        redirect_uri: 'http://sp/redirect',
        state: 'state123',
        idp_hint: 'idpHintVal',
        login_hint: 'user@example.com',
      },
    };

    beforeEach(() => {
      res = {
        redirect: jest.fn(),
        render: jest.fn(),
      };
      // The userSession mock with its own session methods:
      userSession = {
        get: jest.fn(),
        duplicate: jest.fn(),
        reset: jest.fn(),
        set: jest.fn(),
        commit: jest.fn(),
      };
      oidcProviderMock.getInteraction.mockReset();
      configServiceMock.get.mockImplementation((key: string) => {
        if (key === 'App') {
          return {
            urlPrefix: '/prefix',
            defaultEmailRenater: 'default@renater.com',
          };
        }
        return {};
      });
    });

    it('should reuse an active session and redirect to INTERACTION_VERIFY', async () => {
      // Simulate an active session: validateDto returns no errors
      (validateDto as jest.Mock).mockResolvedValue([]);
      // And the session has an idpId matching the hinted idp
      userSession.get.mockReturnValue({ idpId: 'idpHintVal' });
      // identityProvider returns a valid (non-empty) idp
      identityProviderMock.getById.mockResolvedValue({ uid: 'idpHintVal' });
      // serviceProvider returns SP info
      serviceProviderMock.getById.mockResolvedValue({ name: 'SP Name' });
      // Prepare interaction data without any hints
      const interactionNoHints = {
        uid: 'interaction123',
        params: {
          acr_values: 'acr1',
          client_id: 'sp1',
          redirect_uri: 'http://sp/redirect',
          state: 'state123',
          idp_hint: null,
          login_hint: null,
        },
      };
      oidcProviderMock.getInteraction.mockResolvedValue(interactionNoHints);

      await controller.getInteraction(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      // For an active session, the session is duplicated
      expect(userSession.duplicate).toHaveBeenCalled();
      expect(userSession.reset).not.toHaveBeenCalled();

      // The session should be updated with interaction details and reuse flag
      expect(userSession.set).toHaveBeenCalledWith({
        interactionId: 'interaction123',
        spAcr: 'acr1',
        spId: 'sp1',
        spRedirectUri: 'http://sp/redirect',
        spName: 'SP Name',
        spState: 'state123',
        reusesActiveSession: true,
      });
      expect(userSession.commit).toHaveBeenCalled();

      // Tracking calls should be made for both authorization initiation and SSO
      expect(trackingMock.track).toHaveBeenCalledWith(
        'EVENT_AUTHORIZE_INITIATED',
        {
          fc: { interactionId: 'interaction123' },
          req,
          sessionId: req.sessionId,
        },
      );
      expect(trackingMock.track).toHaveBeenCalledWith('EVENT_SSO_INITIATED', {
        fc: { interactionId: 'interaction123' },
        req,
        sessionId: req.sessionId,
      });

      // Should redirect to the INTERACTION_VERIFY URL built with the urlPrefix and interaction id
      const expectedUrl = `/prefix${CoreRoutes.INTERACTION_VERIFY.replace(':uid', 'interaction123')}`;
      expect(res.redirect).toHaveBeenCalledWith(expectedUrl);
    });

    it('should redirect to the hinted IdP when session is inactive and idpHint is provided', async () => {
      // Simulate an inactive session: validateDto returns errors
      (validateDto as jest.Mock).mockResolvedValue(['error']);
      userSession.get.mockReturnValue({});
      // identityProvider returns a valid hinted idp
      identityProviderMock.getById.mockResolvedValue({ uid: 'idpHintVal' });
      serviceProviderMock.getById.mockResolvedValue({ name: 'SP Name' });
      oidcProviderMock.getInteraction.mockResolvedValue(interactionData);

      await controller.getInteraction(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      // For inactive session, the controller resets and then sets a new browsingSessionId
      expect(userSession.reset).toHaveBeenCalled();
      expect(userSession.set).toHaveBeenCalledWith({
        browsingSessionId: 'uuid-mock',
      });
      expect(userSession.duplicate).not.toHaveBeenCalled();

      // Session is then updated with interaction details; since the user is not connected, reusesActiveSession is false
      expect(userSession.set).toHaveBeenCalledWith({
        interactionId: 'interaction123',
        spAcr: 'acr1',
        spId: 'sp1',
        spRedirectUri: 'http://sp/redirect',
        spName: 'SP Name',
        spState: 'state123',
        reusesActiveSession: false,
      });
      expect(userSession.commit).toHaveBeenCalled();

      // Tracking: FC_AUTHORIZE_INITIATED and then, because an idpHint exists, FC_REDIRECTED_TO_HINTED_IDP
      expect(trackingMock.track).toHaveBeenCalledWith(
        'EVENT_AUTHORIZE_INITIATED',
        {
          fc: { interactionId: 'interaction123' },
          req,
          sessionId: req.sessionId,
        },
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        'EVENT_REDIRECTED_TO_HINTED_IDP',
        {
          fc: { interactionId: 'interaction123' },
          req,
          sessionId: req.sessionId,
        },
      );

      // Then the controller should delegate to coreFca.redirectToIdp
      expect(coreFcaMock.redirectToIdp).toHaveBeenCalledWith(
        res,
        'idpHintVal',
        { acr_values: 'acr1' },
      );
    });

    it('should render the interaction view when session is inactive and no idpHint is provided', async () => {
      // Prepare interaction data without any idp_hint
      const interactionNoIdpHint = {
        uid: 'interaction123',
        params: {
          acr_values: 'acr1',
          client_id: 'sp1',
          redirect_uri: 'http://sp/redirect',
          state: 'state123',
          idp_hint: null,
          login_hint: 'user@example.com',
        },
      };
      oidcProviderMock.getInteraction.mockResolvedValue(interactionNoIdpHint);
      (validateDto as jest.Mock).mockResolvedValue(['error']);
      userSession.get.mockReturnValue({});
      serviceProviderMock.getById.mockResolvedValue({ name: 'SP Name' });
      fqdnServiceMock.getFqdnFromEmail.mockReturnValue('fqdn.com');
      notificationsMock.getNotificationToDisplay.mockResolvedValue('notif');
      csrfServiceMock.renew.mockReturnValue('csrf-token');

      await controller.getInteraction(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      expect(userSession.reset).toHaveBeenCalled();
      expect(userSession.set).toHaveBeenCalledWith({
        browsingSessionId: 'uuid-mock',
      });
      expect(userSession.duplicate).not.toHaveBeenCalled();

      expect(userSession.set).toHaveBeenCalledWith({
        interactionId: 'interaction123',
        spAcr: 'acr1',
        spId: 'sp1',
        spRedirectUri: 'http://sp/redirect',
        spName: 'SP Name',
        spState: 'state123',
        reusesActiveSession: false,
      });
      expect(userSession.commit).toHaveBeenCalled();

      // Tracking: FC_AUTHORIZE_INITIATED and then FC_SHOWED_IDP_CHOICE (with fqdn information)
      expect(trackingMock.track).toHaveBeenCalledWith(
        'EVENT_AUTHORIZE_INITIATED',
        {
          fc: { interactionId: 'interaction123' },
          req,
          sessionId: req.sessionId,
        },
      );
      expect(fqdnServiceMock.getFqdnFromEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(trackingMock.track).toHaveBeenCalledWith(
        'EVENT_SHOWED_IDP_CHOICE',
        {
          fc: { interactionId: 'interaction123' },
          req,
          sessionId: req.sessionId,
          fqdn: 'fqdn.com',
        },
      );

      // Then obtain the notification and default email, renew Csrf and store it using the injected sessionService
      expect(notificationsMock.getNotificationToDisplay).toHaveBeenCalled();
      expect(csrfServiceMock.renew).toHaveBeenCalled();
      expect(sessionServiceMock.set).toHaveBeenCalledWith('Csrf', {
        csrfToken: 'csrf-token',
      });

      // Finally, render the 'interaction' view with the expected values
      expect(res.render).toHaveBeenCalledWith('interaction', {
        csrfToken: 'csrf-token',
        defaultEmailRenater: 'default@renater.com',
        notification: 'notif',
        spName: 'SP Name',
        loginHint: 'user@example.com',
      });
    });

    it('should throw CoreIdpHintException when idpHint is provided but identityProvider returns empty', async () => {
      oidcProviderMock.getInteraction.mockResolvedValue(interactionData);
      (validateDto as jest.Mock).mockResolvedValue([]);
      userSession.get.mockReturnValue({});
      // When idp_hint is present but identityProvider.getById returns an empty object,
      // lodash’s isEmpty() will consider it empty and the controller should throw.
      identityProviderMock.getById.mockResolvedValue({});
      await expect(
        controller.getInteraction(
          req as Request,
          res as Response,
          {} as any,
          userSession,
        ),
      ).rejects.toThrow(CoreIdpHintException);
    });
  });

  describe('getVerify()', () => {
    const req: any = { sessionId: 'session1' };
    let res: Partial<Response>;
    let userSession: any;
    // Prepare session data extracted by the decorator
    const sessionData = {
      idpId: 'idp1',
      interactionId: 'interaction123',
      spRedirectUri: 'http://sp/redirect',
      isSilentAuthentication: false,
    };

    beforeEach(() => {
      res = { redirect: jest.fn() };
      userSession = { get: jest.fn().mockReturnValue(sessionData) };
      configServiceMock.get.mockImplementation((key: string) => {
        if (key === 'App') {
          return { urlPrefix: '/prefix' };
        }
        return {};
      });
    });

    it('should redirect using handleErrorLoginRequired when IdP is not active and silent authentication is true', async () => {
      sessionData.isSilentAuthentication = true;
      identityProviderMock.isActiveById.mockResolvedValue(false);
      coreFcaVerifyMock.handleErrorLoginRequired.mockReturnValue('error-url');

      await controller.getVerify(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      expect(identityProviderMock.isActiveById).toHaveBeenCalledWith('idp1');
      expect(coreFcaVerifyMock.handleErrorLoginRequired).toHaveBeenCalledWith(
        'http://sp/redirect',
      );
      expect(res.redirect).toHaveBeenCalledWith('error-url');
    });

    it('should redirect using handleUnavailableIdp when IdP is not active and silent authentication is false', async () => {
      sessionData.isSilentAuthentication = false;
      identityProviderMock.isActiveById.mockResolvedValue(false);
      coreVerifyMock.handleUnavailableIdp.mockResolvedValue('unavailable-url');

      await controller.getVerify(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      expect(coreVerifyMock.handleUnavailableIdp).toHaveBeenCalledWith(
        req,
        {
          urlPrefix: '/prefix',
          interactionId: 'interaction123',
          sessionOidc: userSession,
        },
        true,
      );
      expect(res.redirect).toHaveBeenCalledWith('unavailable-url');
    });

    it('should redirect using handleVerifyIdentity when IdP is active', async () => {
      identityProviderMock.isActiveById.mockResolvedValue(true);
      coreFcaVerifyMock.handleVerifyIdentity.mockResolvedValue('verify-url');

      await controller.getVerify(
        req as Request,
        res as Response,
        {} as any,
        userSession,
      );

      expect(coreFcaVerifyMock.handleVerifyIdentity).toHaveBeenCalledWith(req, {
        urlPrefix: '/prefix',
        interactionId: 'interaction123',
        sessionOidc: userSession,
      });
      expect(res.redirect).toHaveBeenCalledWith('verify-url');
    });
  });
});
