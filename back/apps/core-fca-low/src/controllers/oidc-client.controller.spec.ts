import { Request, Response } from 'express';

import { Test, TestingModule } from '@nestjs/testing';

import { AccountFcaService } from '@fc/account-fca';
import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { AfterRedirectToIdpWithEmailSessionDto, UserSession } from '@fc/core';
import { CryptographyService } from '@fc/cryptography';
import { CsrfService } from '@fc/csrf';
import { LoggerService } from '@fc/logger';
import { OidcClientConfigService, OidcClientService } from '@fc/oidc-client';
import { ISessionService, SessionService } from '@fc/session';

import { getLoggerMock } from '@mocks/logger';

import {
  CoreFcaControllerService,
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
  let coreFcaControllerService: any;
  let coreFcaService: any;
  let sessionService: any;
  let crypto: any;
  let sanitizer: any;
  let csrfService: any;

  beforeEach(async () => {
    accountService = {
      getOrCreateAccount: jest.fn(),
    };
    configService = { get: jest.fn() };
    logger = getLoggerMock();
    oidcClient = {
      getToken: jest.fn(),
      getUserinfo: jest.fn(),
      getEndSessionUrl: jest.fn(),
    };
    oidcClientConfig = { get: jest.fn() };
    coreFcaControllerService = {
      redirectToIdpWithIdpId: jest.fn(),
      redirectToIdpWithEmail: jest.fn(),
    };
    coreFcaService = {
      hasDefaultIdp: jest.fn(),
      isAllowedIdpForEmail: jest.fn(),
      selectIdpsFromEmail: jest.fn(),
      getSortedDisplayableIdentityProviders: jest.fn(),
    };
    sessionService = {
      set: jest.fn(),
      get: jest.fn(),
      destroy: jest.fn(),
      duplicate: jest.fn(),
    };
    crypto = { genRandomString: jest.fn() };
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
        CoreFcaControllerService,
        CoreFcaService,
        SessionService,
        CryptographyService,
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
      .overrideProvider(CoreFcaControllerService)
      .useValue(coreFcaControllerService)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaService)
      .overrideProvider(SessionService)
      .useValue(sessionService)
      .overrideProvider(CryptographyService)
      .useValue(crypto)
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
        get: jest.fn().mockReturnValue({ idpLoginHint: email }),
      } as unknown as ISessionService<AfterRedirectToIdpWithEmailSessionDto>;

      const providers = [
        { title: 'Provider One', uid: 'idp1' },
        { title: 'Autre', uid: 'default-idp' },
      ];
      coreFcaService.selectIdpsFromEmail.mockResolvedValueOnce(providers);
      coreFcaService.hasDefaultIdp.mockReturnValue(true);

      configService.get.mockReturnValue({ defaultIdpId: 'default-idp' });
      csrfService.renew.mockReturnValue('csrf-token');
      coreFcaService.getSortedDisplayableIdentityProviders.mockReturnValueOnce(
        providers,
      );

      await controller.getIdentityProviderSelection(
        res as Response,
        userSession,
      );

      // Should set Csrf token in session and render with data
      expect(sessionService.set).toHaveBeenCalledWith('Csrf', {
        csrfToken: 'csrf-token',
      });
      expect(res.render).toHaveBeenCalledWith('interaction-identity-provider', {
        csrfToken: 'csrf-token',
        identityProviders: providers,
        hasDefaultIdp: true,
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

    it('should redirect to selected idp when identityProviderUid is provided', async () => {
      const body = { identityProviderUid: 'idp123' } as any;

      await controller.postIdentityProviderSelection(
        req as Request,
        res as Response,
        body,
      );

      expect(
        coreFcaControllerService.redirectToIdpWithIdpId,
      ).toHaveBeenCalledWith(req, res, 'idp123');
    });

    it('should delegate to service redirectToIdpWithEmail with provided rememberMe', async () => {
      const body = { email, rememberMe: true } as any;

      await controller.redirectToIdp(
        req as Request,
        res as Response,
        body,
        userSession,
      );

      expect(
        coreFcaControllerService.redirectToIdpWithEmail,
      ).toHaveBeenCalledWith(req, res, email, true);
    });

    it('should delegate to service with rememberMe defaulting to false when not provided', async () => {
      const body = { email } as any;

      await controller.redirectToIdp(
        req as Request,
        res as Response,
        body,
        userSession,
      );

      expect(
        coreFcaControllerService.redirectToIdpWithEmail,
      ).toHaveBeenCalledWith(req, res, email, false);
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
      const userSession = {
        get: jest.fn().mockReturnValue({ oidcProviderLogoutForm: 'form-data' }),
        destroy: jest.fn().mockResolvedValue(undefined),
      } as unknown as ISessionService<UserSession>;

      const result = await controller.redirectAfterIdpLogout(req, userSession);
      expect(logger.track).toHaveBeenCalledWith('FC_SESSION_TERMINATED');
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
      idpLoginHint: 'user@example.com',
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
      logger.track.mockResolvedValue(undefined);
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
      coreFcaService['isAllowedIdpForEmail'].mockResolvedValue(true);
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
      expect(logger.track).toHaveBeenCalledWith('IDP_CALLEDBACK');
      expect(oidcClient.getToken).toHaveBeenCalledWith(
        'idp123',
        { state: 'state123', nonce: 'nonce123' },
        req,
        { sp_id: 'sp123', sp_name: 'SP Name' },
      );
      expect(logger.track).toHaveBeenCalledWith('FC_REQUESTED_IDP_TOKEN');
      expect(oidcClient.getUserinfo).toHaveBeenCalledWith({
        accessToken: 'access-token',
        idpId: 'idp123',
      });
      expect(logger.track).toHaveBeenNthCalledWith(1, 'IDP_CALLEDBACK');
      expect(logger.track).toHaveBeenNthCalledWith(2, 'FC_REQUESTED_IDP_TOKEN');
      expect(logger.track).toHaveBeenNthCalledWith(
        3,
        'FC_REQUESTED_IDP_USERINFO',
      );
      expect(coreFcaService['isAllowedIdpForEmail']).toHaveBeenCalledWith(
        'idp123',
        'user@example.com',
      );
      expect(userSession.set).toHaveBeenNthCalledWith(2, {
        amr: 'amr-value',
        idpIdToken: 'id-token',
        idpAcr: 'acr-value',
      });
      expect(userSession.set).toHaveBeenNthCalledWith(3, {
        idpIdentity: { email: 'user@example.com', sub: 'sub123' },
      });
      expect(userSession.set).toHaveBeenNthCalledWith(4, {
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
      coreFcaService['isAllowedIdpForEmail'].mockResolvedValue(false);

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(sanitizer.getValidatedIdentityFromIdp).toHaveBeenCalledWith(
        { email: 'user@example.com', sub: 'sub123' },
        'idp123',
      );
      expect(logger.warn).toHaveBeenCalledWith({ code: 'fqdn_mismatch' });
      expect(userSession.set).toHaveBeenCalledWith({
        amr: 'amr-value',
        idpIdToken: 'id-token',
        idpAcr: 'acr-value',
      });
      expect(userSession.set).toHaveBeenCalledWith({
        idpIdentity: sanitizedIdentity,
      });
      expect(userSession.set).toHaveBeenCalledWith({
        spIdentity: expect.anything(),
      });
      expect(res.redirect).toHaveBeenCalledWith(
        '/app/interaction/interaction123/verify',
      );
    });
  });
});
