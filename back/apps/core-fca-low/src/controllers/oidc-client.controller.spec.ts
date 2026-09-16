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
import { UserSession } from "../dto";
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

    it("should process OIDC callback when identity validation errors occur (sanitization branch and attached email domain mismatch)", async () => {
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
        idpAmr: "amr-value",
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
});
