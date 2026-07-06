import { AccountFcaService } from "@fc/account-fca";
import { validateDto } from "@fc/common";
import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { LoggerService } from "@fc/logger";
import { OidcClientService } from "@fc/oidc-client";
import { ISessionService, SessionService } from "@fc/session";
import { getLoggerMock } from "@mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { type Request, type Response } from "express";
import { AfterRedirectToIdpWithEmailSessionDto, UserSession } from "../dto";
import {
  CoreFcaControllerService,
  CoreFcaService,
  IdentitySanitizer,
} from "../services";
import { OidcClientController } from "./oidc-client.controller";

jest.mock("@fc/common", () => ({
  ...jest.requireActual("@fc/common"),
  validateDto: jest.fn(),
}));

describe("OidcClientController", () => {
  let controller: OidcClientController;

  // Mocks for injected services
  let accountService: any;
  let configService: any;
  let logger: any;
  let oidcClient: any;
  let coreFcaControllerService: any;
  let coreFcaService: any;
  let sessionService: any;
  let sanitizer: any;
  let csrfService: any;

  beforeEach(async () => {
    accountService = {
      getOrCreateAccount: jest.fn(),
    };
    configService = {
      get: jest.fn().mockImplementation((key: string) => {
        switch (key) {
          case "OidcClient":
            return { scope: "openid email" };
          case "App":
            return { urlPrefix: "/app" };
          case "ApiEntreprise":
            return { featureFetchOrganizationData: true };
        }
      }),
    };
    logger = getLoggerMock();
    oidcClient = {
      getToken: jest.fn(),
      getUserinfo: jest.fn(),
      getEndSessionUrl: jest.fn(),
    };
    coreFcaControllerService = {
      redirectToIdpWithIdpId: jest.fn(),
      redirectToIdpWithEmail: jest.fn(),
    };
    coreFcaService = {
      hasDefaultIdp: jest.fn(),
      ensureIdpCanServeThisEmail: jest.fn(),
      selectIdpsFromEmail: jest.fn(),
      getSortedDisplayableIdentityProviders: jest.fn(),
      safelyGetExistingAndEnabledIdp: jest.fn(),
    };
    sessionService = {
      set: jest.fn(),
      get: jest.fn(),
      destroy: jest.fn(),
      duplicate: jest.fn(),
    };
    sanitizer = {
      getValidatedIdentityFromIdp: jest.fn(),
      transformIdentity: jest.fn(),
    };
    csrfService = { getOrCreate: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [OidcClientController],
      providers: [
        AccountFcaService,
        ConfigService,
        LoggerService,
        OidcClientService,
        CoreFcaControllerService,
        CoreFcaService,
        SessionService,
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
      .overrideProvider(CoreFcaControllerService)
      .useValue(coreFcaControllerService)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaService)
      .overrideProvider(SessionService)
      .useValue(sessionService)
      .overrideProvider(IdentitySanitizer)
      .useValue(sanitizer)
      .overrideProvider(CsrfService)
      .useValue(csrfService)
      .compile();

    controller = module.get<OidcClientController>(OidcClientController);
    jest.clearAllMocks();
    (validateDto as jest.Mock).mockReset();

    coreFcaService.safelyGetExistingAndEnabledIdp.mockReturnValue({
      isEntraID: false,
    });
  });

  describe("getIdentityProviderSelection", () => {
    it("should render the identity provider selection view with proper response", async () => {
      const res = { render: jest.fn() };
      const email = "user@example.com";
      const userSession = {
        get: jest.fn().mockReturnValue({ idpLoginHint: email }),
      } as unknown as ISessionService<AfterRedirectToIdpWithEmailSessionDto>;

      const providers = [
        { title: "Provider One", uid: "idp1" },
        { title: "Autre", uid: "default-idp" },
      ];
      coreFcaService.selectIdpsFromEmail.mockResolvedValueOnce(providers);
      coreFcaService.hasDefaultIdp.mockReturnValue(true);

      configService.get.mockReturnValue({
        defaultIdpId: "default-idp",
        scope: "openid",
      });
      csrfService.getOrCreate.mockReturnValue("csrf-token");
      coreFcaService.getSortedDisplayableIdentityProviders.mockReturnValueOnce(
        providers,
      );

      await controller.getIdentityProviderSelection(
        res as unknown as Response,
        userSession,
      );

      expect(res.render).toHaveBeenCalledWith("identity-provider-selection", {
        csrfToken: "csrf-token",
        identityProviders: providers,
        hasDefaultIdp: true,
      });

      expect(csrfService.getOrCreate).toHaveBeenCalled();
    });
  });

  describe("postIdentityProviderSelection", () => {
    let req: any;
    let res: Partial<Response>;
    let userSession: any;
    const email = "user@example.com";

    beforeEach(() => {
      req = {};
      res = { redirect: jest.fn() } as Partial<Response>;
      userSession = {
        set: jest.fn(),
      } as unknown as ISessionService<UserSession>;
    });

    it("should redirect to selected idp when identityProviderUid is provided", async () => {
      const body = { identityProviderUid: "idp123" } as any;

      await controller.postIdentityProviderSelection(
        req as Request,
        res as Response,
        body,
      );

      expect(
        coreFcaControllerService.redirectToIdpWithIdpId,
      ).toHaveBeenCalledWith(req, res, "idp123");
    });

    it("should delegate to service redirectToIdpWithEmail with provided rememberMe", async () => {
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

    it("should delegate to service with rememberMe defaulting to false when not provided", async () => {
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

  describe("getOidcCallback", () => {
    let req: Partial<Request>;
    let res: Partial<Response>;
    let userSession: any;
    const sessionData = {
      idpId: "idp123",
      idpNonce: "nonce123",
      idpState: "state123",
      interactionId: "interaction123",
      spId: "sp123",
      spName: "SP Name",
      idpLoginHint: "user@example.com",
    };

    beforeEach(() => {
      req = {};
      res = {
        redirect: jest.fn(),
        status: jest.fn(),
        render: jest.fn(),
      } as Partial<Response>;
      accountService.getOrCreateAccount.mockResolvedValue({ id: "123" });
      userSession = {
        duplicate: jest.fn().mockResolvedValue(undefined),
        get: jest.fn().mockReturnValue(sessionData),
        set: jest.fn(),
      };
      logger.track.mockResolvedValue(undefined);
      oidcClient.getToken.mockResolvedValue({
        accessToken: "access-token",
        idToken: "id-token",
        claims: {
          acr: "acr-value",
          amr: "amr-value",
        },
      });
      oidcClient.getUserinfo.mockResolvedValue({
        email: "user@example.com",
        sub: "sub123",
      });
      (validateDto as jest.Mock).mockResolvedValue([]);
      coreFcaService["ensureIdpCanServeThisEmail"].mockResolvedValue(true);
      sanitizer.getValidatedIdentityFromIdp.mockResolvedValue({
        email: "user@example.com",
        sub: "sub123",
      });
      sanitizer.transformIdentity.mockResolvedValue({ given_name: "John" });
      accountService.getOrCreateAccount.mockResolvedValue({
        sub: "accountSub",
      });
    });

    it("should process OIDC callback when identity is valid (no validation errors)", async () => {
      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(userSession.duplicate).toHaveBeenCalled();
      expect(userSession.get).toHaveBeenCalled();
      // Expect nonce and state removal
      expect(userSession.set).toHaveBeenCalledWith({
        idpNonce: undefined,
        idpState: undefined,
      });
      expect(logger.track).toHaveBeenCalledWith("IDP_CALLEDBACK");
      expect(oidcClient.getToken).toHaveBeenCalledWith({
        idpId: "idp123",
        req,
        idpState: "state123",
        idpNonce: "nonce123",
        spId: "sp123",
        spName: "SP Name",
      });
      expect(logger.track).toHaveBeenCalledWith("FC_REQUESTED_IDP_TOKEN");
      expect(oidcClient.getUserinfo).toHaveBeenCalledWith({
        accessToken: "access-token",
        idpId: "idp123",
        claims: {
          acr: "acr-value",
          amr: "amr-value",
        },
      });
      expect(logger.track).toHaveBeenNthCalledWith(1, "IDP_CALLEDBACK");
      expect(logger.track).toHaveBeenNthCalledWith(2, "FC_REQUESTED_IDP_TOKEN");
      expect(logger.track).toHaveBeenNthCalledWith(
        3,
        "FC_REQUESTED_IDP_USERINFO",
      );
      expect(coreFcaService["ensureIdpCanServeThisEmail"]).toHaveBeenCalledWith(
        "idp123",
        "user@example.com",
      );
      expect(userSession.set).toHaveBeenNthCalledWith(2, {
        amr: "amr-value",
        idpIdToken: "id-token",
        idpAcr: "acr-value",
      });
      expect(userSession.set).toHaveBeenNthCalledWith(3, {
        idpIdentity: { email: "user@example.com", sub: "sub123" },
      });
      expect(userSession.set).toHaveBeenNthCalledWith(4, {
        spIdentity: { given_name: "John" },
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/app/interaction/interaction123/verify",
      );
    });

    it("should augment userInfo identity with claims in idToken if IdP is Entra", async () => {
      // When IdP is EntraID…
      coreFcaService.safelyGetExistingAndEnabledIdp.mockReturnValue({
        isEntraID: true,
      });

      // …claims that correspond to requested scopes…
      configService.get.mockImplementation((key: string) => {
        switch (key) {
          case "OidcClient":
            return { scope: "openid arbitrary" };
          case "App":
            return { urlPrefix: "/app" };
          case "ApiEntreprise":
            return { featureFetchOrganizationData: true };
        }
      });
      // …and that appear in the ID token…
      oidcClient.getToken.mockResolvedValue({
        idToken: "id-token",
        claims: {
          arbitrary: "user@example.com",
          ignored: "ignored",
        },
      });
      // The oidc-client service merges claims for Entra, so the mock should return the merged result
      oidcClient.getUserinfo.mockResolvedValue({
        sub: "sub123",
        arbitrary: "user@example.com",
      });

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      // …will be used to compose the identity
      expect(sanitizer.getValidatedIdentityFromIdp).toHaveBeenCalledWith(
        { arbitrary: "user@example.com", sub: "sub123" },
        "idp123",
      );
    });

    it('should accept the "acrs" claim (an array) and map it', async () => {
      // Only for Entra
      coreFcaService.safelyGetExistingAndEnabledIdp.mockReturnValue({
        isEntraID: true,
      });

      // The oidc-client service processes the acrs array and sets the acr claim
      oidcClient.getToken.mockResolvedValue({
        idToken: "id-token",
        claims: {
          acr: "eidas2",
          acrs: ["c2", "p1", "urn:user:registersecurityinfo"],
        },
      });

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(sanitizer.transformIdentity).toHaveBeenCalledWith(
        { email: "user@example.com", sub: "sub123" },
        "idp123",
        "accountSub",
        "eidas2",
      );
    });

    it("should provide a default acr if missing", async () => {
      // The oidc-client service sets a default acr of 'eidas1' if missing
      oidcClient.getToken.mockResolvedValue({
        idToken: "id-token",
        claims: {
          acr: "eidas1",
        },
      });

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(sanitizer.transformIdentity).toHaveBeenCalledWith(
        { email: "user@example.com", sub: "sub123" },
        "idp123",
        "accountSub",
        "eidas1",
      );
    });

    it("should process OIDC callback when identity validation errors occur (sanitization branch and FQDN mismatch)", async () => {
      // Simulate errors so that the sanitizer is called
      const sanitizedIdentity = {
        email: "sanitized@example.com",
        sub: "sub-sanitized",
      };
      sanitizer.getValidatedIdentityFromIdp.mockResolvedValue(
        sanitizedIdentity,
      );
      coreFcaService["ensureIdpCanServeThisEmail"].mockResolvedValue(false);

      await controller.getOidcCallback(
        req as Request,
        res as Response,
        userSession,
      );

      expect(sanitizer.getValidatedIdentityFromIdp).toHaveBeenCalledWith(
        { email: "user@example.com", sub: "sub123" },
        "idp123",
      );
      expect(userSession.set).toHaveBeenCalledWith({
        amr: "amr-value",
        idpIdToken: "id-token",
        idpAcr: "acr-value",
      });
      expect(userSession.set).toHaveBeenCalledWith({
        idpIdentity: sanitizedIdentity,
      });
      expect(userSession.set).toHaveBeenCalledWith({
        spIdentity: expect.anything(),
      });
      expect(res.redirect).toHaveBeenCalledWith(
        "/app/interaction/interaction123/verify",
      );
    });
  });

  describe("getOidcLogoutCallback", () => {
    it("should track session termination, destroy the session and render the logout form", () => {
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest.fn().mockReturnValue({}),
      } as unknown as ISessionService<UserSession>;
      controller.getOidcLogoutCallback(res, userSession);

      expect(res.redirect).toHaveBeenCalled();
    });

    it("should append redirection url if params are stored in session", () => {
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest.fn().mockReturnValue("jean"),
      } as unknown as ISessionService<UserSession>;
      controller.getOidcLogoutCallback(res, userSession);

      expect(res.redirect).toHaveBeenCalledWith(
        "/app/session/end?from_idp=true&jean",
      );
    });
  });
});
