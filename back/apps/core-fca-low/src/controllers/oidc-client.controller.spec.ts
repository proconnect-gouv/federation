import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { AccountFcaService } from '@fc/account-fca';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core';
import { CryptographyService } from '@fc/cryptography';
import { CsrfService } from '@fc/csrf';
import { EmailValidatorService } from '@fc/email-validator/services';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcClientConfigService, OidcClientService } from '@fc/oidc-client';
import { ISessionService, SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';

import { Routes } from '../enums';
import { CoreFcaAgentNoIdpException } from '../exceptions';
import {
  CoreFcaFqdnService,
  CoreFcaService,
  IdentitySanitizer,
} from '../services';
import { OidcClientController } from './oidc-client.controller';

jest.mock('@fc/common', () => ({
  ...jest.requireActual('@fc/common'),
  validateDto: jest.fn(),
}));

describe('OidcClientController', () => {
  let controller: OidcClientController;

  // Mocks for injected services
  let accountService: any;
  let configService: any;
  let logger: any;
  let oidcClient: any;
  let oidcClientConfig: any;
  let coreFca: any;
  let identityProvider: any;
  let sessionService: any;
  let tracking: any;
  let crypto: any;
  let emailValidatorService: any;
  let fqdnService: any;
  let sanitizer: any;
  let csrfService: any;

  beforeEach(async () => {
    accountService = {
      getOrCreateAccount: jest.fn(),
    };
    configService = { get: jest.fn() };
    logger = { debug: jest.fn(), warning: jest.fn() };
    oidcClient = {
      utils: { wellKnownKeys: jest.fn() },
      getToken: jest.fn(),
      getUserinfo: jest.fn(),
      getEndSessionUrl: jest.fn(),
    };
    oidcClientConfig = { get: jest.fn() };
    coreFca = {
      getIdentityProvidersByIds: jest.fn(),
      redirectToIdp: jest.fn(),
    };
    identityProvider = { getById: jest.fn() };
    sessionService = {
      set: jest.fn(),
      get: jest.fn(),
      destroy: jest.fn(),
      duplicate: jest.fn(),
    };
    tracking = {
      track: jest.fn(),
      TrackedEventsMap: {
        FC_REDIRECT_TO_IDP: 'FC_REDIRECT_TO_IDP',
        FC_SESSION_TERMINATED: 'FC_SESSION_TERMINATED',
        IDP_CALLEDBACK: 'IDP_CALLEDBACK',
        FC_REQUESTED_IDP_TOKEN: 'FC_REQUESTED_IDP_TOKEN',
        FC_REQUESTED_IDP_USERINFO: 'FC_REQUESTED_IDP_USERINFO',
        FC_FQDN_MISMATCH: 'FC_FQDN_MISMATCH',
      },
    };
    crypto = { genRandomString: jest.fn() };
    emailValidatorService = { validate: jest.fn() };
    fqdnService = {
      getFqdnConfigFromEmail: jest.fn(),
      getFqdnFromEmail: jest.fn(),
      isAllowedIdpForEmail: jest.fn(),
    };
    sanitizer = {
      getValidatedIdentityFromIdp: jest.fn(),
      transformIdentity: jest.fn(),
    };
    csrfService = { renew: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        AccountFcaService,
        ConfigService,
        LoggerService,
        OidcClientService,
        OidcClientConfigService,
        CoreFcaService,
        IdentityProviderAdapterMongoService,
        SessionService,
        TrackingService,
        CryptographyService,
        EmailValidatorService,
        CoreFcaFqdnService,
        IdentitySanitizer,
        CsrfService,
      ],
    })
      .overrideProvider(AccountFcaService)
      .useValue(accountService)
      .overrideProvider(ConfigService)
      .useValue(configService)
      .overrideProvider(LoggerService)
      .useValue(logger)
      .overrideProvider(OidcClientService)
      .useValue(oidcClient)
      .overrideProvider(OidcClientConfigService)
      .useValue(oidcClientConfig)
      .overrideProvider(CoreFcaService)
      .useValue(coreFca)
      .overrideProvider(IdentityProviderAdapterMongoService)
      .useValue(identityProvider)
      .overrideProvider(SessionService)
      .useValue(sessionService)
      .overrideProvider(TrackingService)
      .useValue(tracking)
      .overrideProvider(CryptographyService)
      .useValue(crypto)
      .overrideProvider(EmailValidatorService)
      .useValue(emailValidatorService)
      .overrideProvider(CoreFcaFqdnService)
      .useValue(fqdnService)
      .overrideProvider(IdentitySanitizer)
      .useValue(sanitizer)
      .overrideProvider(CsrfService)
      .useValue(csrfService)
      .compile();

    controller = module.get<OidcClientController>(OidcClientController);
    jest.clearAllMocks();
    (validateDto as jest.Mock).mockReset();
  });

  describe('getIdentityProviderSelection', () => {
    it('should render the identity provider selection view with proper response', async () => {
      const res: Partial<Response> = { render: jest.fn() };
      const email = 'user@example.com';
      const userSession = {
        get: jest.fn().mockReturnValue({ login_hint: email }),
      } as unknown as ISessionService<UserSession>;

      const fqdnConfig = {
        acceptsDefaultIdp: true,
        identityProviders: ['idp1', 'idp2'],
      };
      fqdnService.getFqdnConfigFromEmail.mockResolvedValue(fqdnConfig);

      const providers = [
        { title: 'Provider One', uid: 'idp1' },
        { title: 'Autre', uid: 'default-idp' },
      ];
      coreFca.getIdentityProvidersByIds.mockResolvedValue(providers);

      configService.get.mockReturnValue({ defaultIdpId: 'default-idp' });
      csrfService.renew.mockReturnValue('csrf-token');

      await controller.getIdentityProviderSelection(
        res as Response,
        userSession,
      );

      // Should set Csrf token in session and render with data
      expect(sessionService.set).toHaveBeenCalledWith('Csrf', {
        csrfToken: 'csrf-token',
      });
      expect(res.render).toHaveBeenCalledWith('interaction-identity-provider', {
        acceptsDefaultIdp: fqdnConfig.acceptsDefaultIdp,
        csrfToken: 'csrf-token',
        email,
        providers,
      });
    });
  });

  describe('postIdentityProviderSelection', () => {
    let req: any;
    let res: Partial<Response>;
    let userSession: any;
    const email = 'user@example.com';

    beforeEach(() => {
      req = {};
      res = { redirect: jest.fn() } as Partial<Response>;
      userSession = {
        set: jest.fn(),
      } as unknown as ISessionService<UserSession>;
    });

    it('should track and redirect to selected idp when identityProviderUid is provided', async () => {
      const body = { identityProviderUid: 'idp123' } as any;
      const sessionWithEmail = {
        get: jest.fn().mockReturnValue({ login_hint: email }),
      } as any;
      fqdnService.getFqdnFromEmail.mockReturnValue('fqdn.com');
      identityProvider.getById.mockResolvedValue({
        name: 'Idp Name',
        title: 'Idp Title',
      });

      await controller.postIdentityProviderSelection(
        req as Request,
        res as Response,
        body,
        sessionWithEmail,
      );

      expect(fqdnService.getFqdnFromEmail).toHaveBeenCalledWith(email);
      expect(identityProvider.getById).toHaveBeenCalledWith('idp123');
      expect(logger.debug).toHaveBeenCalledWith(
        `Redirect "****@fqdn.com" to selected idp "Idp Title" (idp123)`,
      );
      expect(tracking.track).toHaveBeenCalledWith('FC_REDIRECT_TO_IDP', {
        req,
        fqdn: 'fqdn.com',
        idpId: 'idp123',
        idpLabel: 'Idp Title',
        idpName: 'Idp Name',
      });
      expect(coreFca.redirectToIdp).toHaveBeenCalledWith(req, res, 'idp123');
    });

    it('should throw an exception when no identity providers are available', async () => {
      const body = { email, rememberMe: true } as any;
      emailValidatorService.validate.mockResolvedValue(undefined);
      fqdnService.getFqdnFromEmail.mockReturnValue('fqdn.com');
      fqdnService.getFqdnConfigFromEmail.mockResolvedValue({
        identityProviders: [],
      });

      await expect(
        controller.redirectToIdp(
          req as Request,
          res as Response,
          body,
          userSession,
        ),
      ).rejects.toThrow(CoreFcaAgentNoIdpException);
      expect(userSession.set).toHaveBeenCalledWith('rememberMe', true);
      expect(userSession.set).toHaveBeenCalledWith('login_hint', email);
    });

    it('should redirect to identity provider selection when multiple providers are available', async () => {
      const body = { email } as any;
      emailValidatorService.validate.mockResolvedValue(undefined);
      fqdnService.getFqdnFromEmail.mockReturnValue('fqdn.com');
      fqdnService.getFqdnConfigFromEmail.mockResolvedValue({
        identityProviders: ['idp1', 'idp2'],
      });
      configService.get.mockReturnValue({ urlPrefix: '/app' });

      await controller.redirectToIdp(
        req as Request,
        res as Response,
        body,
        userSession,
      );

      expect(userSession.set).toHaveBeenCalledWith('rememberMe', false);
      expect(userSession.set).toHaveBeenCalledWith('login_hint', email);
      expect(logger.debug).toHaveBeenCalledWith(
        '2 identity providers matching for "****@fqdn.com"',
      );
      expect(res.redirect).toHaveBeenCalledWith(
        '/app' + Routes.IDENTITY_PROVIDER_SELECTION,
      );
    });

    it('should process redirection when a single identity provider is available', async () => {
      const body = { email, rememberMe: true } as any;
      emailValidatorService.validate.mockResolvedValue(undefined);
      fqdnService.getFqdnFromEmail.mockReturnValue('fqdn.com');
      fqdnService.getFqdnConfigFromEmail.mockResolvedValue({
        identityProviders: ['idp-single'],
      });
      identityProvider.getById.mockResolvedValue({
        name: 'Single IdP',
        title: 'Single Title',
      });

      await controller.redirectToIdp(
        req as Request,
        res as Response,
        body,
        userSession,
      );

      expect(userSession.set).toHaveBeenCalledWith('rememberMe', true);
      expect(userSession.set).toHaveBeenCalledWith('login_hint', email);
      expect(identityProvider.getById).toHaveBeenCalledWith('idp-single');
      expect(logger.debug).toHaveBeenCalledWith(
        'Redirect "****@fqdn.com" to unique idp "Single Title" (idp-single)',
      );
      expect(tracking.track).toHaveBeenCalledWith('FC_REDIRECT_TO_IDP', {
        req,
        fqdn: 'fqdn.com',
        idpId: 'idp-single',
        idpLabel: 'Single Title',
        idpName: 'Single IdP',
      });
      expect(coreFca.redirectToIdp).toHaveBeenCalledWith(
        req,
        res,
        'idp-single',
      );
    });
  });

  describe('getWellKnownKeys', () => {
    it('should return well known keys', async () => {
      oidcClient.utils.wellKnownKeys.mockResolvedValue('keys');
      const result = await controller.getWellKnownKeys();
      expect(result).toBe('keys');
      expect(oidcClient.utils.wellKnownKeys).toHaveBeenCalled();
    });
  });

  describe('logoutFromIdp', () => {
    it('should redirect to the end session URL', async () => {
      const res: Partial<Response> = { redirect: jest.fn() };
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ idpIdToken: 'token', idpId: 'idp123' }),
      } as unknown as ISessionService<UserSession>;
      oidcClientConfig.get.mockResolvedValue({ stateLength: 10 });
      crypto.genRandomString.mockReturnValue('random-state');
      oidcClient.getEndSessionUrl.mockResolvedValue('end-session-url');

      await controller.logoutFromIdp(res as Response, userSession);

      expect(oidcClientConfig.get).toHaveBeenCalled();
      expect(crypto.genRandomString).toHaveBeenCalledWith(10);
      expect(oidcClient.getEndSessionUrl).toHaveBeenCalledWith(
        'idp123',
        'random-state',
        'token',
      );
      expect(res.redirect).toHaveBeenCalledWith('end-session-url');
    });
  });

  describe('redirectAfterIdpLogout', () => {
    it('should track session termination, destroy the session and render the logout form', async () => {
      const req = {} as Request;
      const res: Partial<Response> = {};
      const userSession = {
        get: jest.fn().mockReturnValue({ oidcProviderLogoutForm: 'form-data' }),
        destroy: jest.fn().mockResolvedValue(undefined),
      } as unknown as ISessionService<UserSession>;

      const result = await controller.redirectAfterIdpLogout(
        req,
        res,
        userSession,
      );
      expect(tracking.track).toHaveBeenCalledWith('FC_SESSION_TERMINATED', {
        req,
      });
      expect(userSession.destroy).toHaveBeenCalled();
      expect(result).toEqual({ oidcProviderLogoutForm: 'form-data' });
    });
  });

  describe('getOidcCallback', () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let userSession: any;
    const sessionData = {
      idpId: 'idp123',
      idpNonce: 'nonce123',
      idpState: 'state123',
      interactionId: 'interaction123',
      spId: 'sp123',
      spName: 'SP Name',
      login_hint: 'user@example.com',
    };

    beforeEach(() => {
      req = {};
      res = {
        redirect: jest.fn(),
        status: jest.fn(),
        render: jest.fn(),
      } as Partial<Response>;
      accountService.getOrCreateAccount.mockResolvedValue({ id: '123' });
      userSession = {
        duplicate: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockReturnValue(sessionData),
        set: jest.fn(),
      };
      fqdnService.getFqdnFromEmail.mockReturnValue('fqdn.com');
      tracking.track.mockResolvedValue(undefined);
      oidcClient.getToken.mockResolvedValue({
        accessToken: 'access-token',
        idToken: 'id-token',
        acr: 'acr-value',
        amr: 'amr-value',
      });
      oidcClient.getUserinfo.mockResolvedValue({
        email: 'user@example.com',
        sub: 'sub123',
      });
      (validateDto as jest.Mock).mockResolvedValue([]);
      fqdnService.isAllowedIdpForEmail.mockResolvedValue(true);
      configService.get.mockReturnValue({ urlPrefix: '/app' });
      sanitizer.getValidatedIdentityFromIdp.mockResolvedValue({
        email: 'user@example.com',
        sub: 'sub123',
      });
      sanitizer.transformIdentity.mockResolvedValue({ given_name: 'John' });
      accountService.getOrCreateAccount.mockResolvedValue({
        sub: 'accountSub',
      });
    });

    it('should process OIDC callback when identity is valid (no validation errors)', async () => {
      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(userSession.duplicate).toHaveBeenCalled();
      expect(userSession.get).toHaveBeenCalled();
      // Expect nonce and state removal
      expect(userSession.set).toHaveBeenCalledWith({
        idpNonce: null,
        idpState: null,
      });
      expect(fqdnService.getFqdnFromEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(tracking.track).toHaveBeenCalledWith('IDP_CALLEDBACK', {
        req,
        fqdn: 'fqdn.com',
        email: 'user@example.com',
      });
      expect(oidcClient.getToken).toHaveBeenCalledWith(
        'idp123',
        { state: 'state123', nonce: 'nonce123' },
        req,
        { sp_id: 'sp123', sp_name: 'SP Name' },
      );
      expect(tracking.track).toHaveBeenCalledWith('FC_REQUESTED_IDP_TOKEN', {
        req,
        fqdn: 'fqdn.com',
        email: 'user@example.com',
      });
      expect(oidcClient.getUserinfo).toHaveBeenCalledWith({
        accessToken: 'access-token',
        idpId: 'idp123',
      });
      // Called twice: once for login_hint and once for identity email
      expect(fqdnService.getFqdnFromEmail).toHaveBeenCalledWith(
        'user@example.com',
      );
      expect(tracking.track).toHaveBeenNthCalledWith(1, 'IDP_CALLEDBACK', {
        req,
        fqdn: 'fqdn.com',
        email: 'user@example.com',
      });
      expect(tracking.track).toHaveBeenNthCalledWith(
        2,
        'FC_REQUESTED_IDP_TOKEN',
        {
          req,
          fqdn: 'fqdn.com',
          email: 'user@example.com',
        },
      );
      expect(tracking.track).toHaveBeenNthCalledWith(
        3,
        'FC_REQUESTED_IDP_USERINFO',
        {
          req,
          fqdn: 'fqdn.com',
          email: 'user@example.com',
          idpSub: 'sub123',
        },
      );
      expect(fqdnService.isAllowedIdpForEmail).toHaveBeenCalledWith(
        'idp123',
        'user@example.com',
      );
      expect(userSession.set).toHaveBeenNthCalledWith(1, {
        idpNonce: null,
        idpState: null,
      });
      expect(userSession.set).toHaveBeenNthCalledWith(2, {
        amr: 'amr-value',
        idpIdToken: 'id-token',
        idpAcr: 'acr-value',
        idpIdentity: { email: 'user@example.com', sub: 'sub123' },
        spIdentity: { given_name: 'John' },
      });
      expect(configService.get).toHaveBeenCalledWith('App');
      expect(res.redirect).toHaveBeenCalledWith(
        '/app/interaction/interaction123/verify',
      );
    });

    it('should process OIDC callback when identity validation errors occur (sanitization branch and FQDN mismatch)', async () => {
      // Simulate errors so that the sanitizer is called
      const sanitizedIdentity = {
        email: 'sanitized@example.com',
        sub: 'sub-sanitized',
      };
      sanitizer.getValidatedIdentityFromIdp.mockResolvedValue(
        sanitizedIdentity,
      );
      fqdnService.isAllowedIdpForEmail.mockResolvedValue(false);

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(sanitizer.getValidatedIdentityFromIdp).toHaveBeenCalledWith(
        { email: 'user@example.com', sub: 'sub123' },
        'idp123',
      );
      expect(logger.warning).toHaveBeenCalledWith(
        'Identity from "idp123" using "***@fqdn.com" is not allowed',
      );
      expect(tracking.track).toHaveBeenCalledWith('FC_FQDN_MISMATCH', {
        req,
        fqdn: 'fqdn.com',
      });
      expect(userSession.set).toHaveBeenCalledWith({
        amr: 'amr-value',
        idpIdToken: 'id-token',
        idpAcr: 'acr-value',
        idpIdentity: sanitizedIdentity,
        spIdentity: expect.anything(),
      });
      expect(res.redirect).toHaveBeenCalledWith(
        '/app/interaction/interaction123/verify',
      );
    });
  });
});
