import { AccountFcaService } from "@fc/account-fca";
import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { IdentityProviderAdapterMongoService } from "@fc/identity-provider-adapter-mongo";
import { LoggerService } from "@fc/logger";
import { NotificationsService } from "@fc/notifications";
import { OidcAcrService } from "@fc/oidc-acr";
import { OidcProviderService } from "@fc/oidc-provider";
import { ServiceProviderAdapterMongoService } from "@fc/service-provider-adapter-mongo";
import { ISessionService, SessionService } from "@fc/session";
import { getLoggerMock } from "@mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { validate } from "class-validator";
import { Request, Response } from "express";

// --- Mocks for external dependencies ---
import { EmailVerificationService } from "@fc/email-verification";
import { AfterGetOidcCallbackSessionDto } from "../dto";
import {
  AgentAccountBlockedException,
  AgentNotFromPublicServiceException,
} from "../exceptions";
import { CoreFcaControllerService, CoreFcaService } from "../services";
import { InteractionController } from "./interaction.controller";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "uuid-mock"),
}));

jest.mock("class-validator", () => ({
  ...jest.requireActual("class-validator"),
  validate: jest.fn(),
}));

describe("InteractionController", () => {
  let controller: InteractionController;

  // Mocks for all dependencies injected in the constructor:
  let oidcProviderMock: any;
  let identityProviderMock: any;
  let oidcAcrMock: any;
  let serviceProviderMock: any;
  let configServiceMock: any;
  let notificationsMock: any;
  let sessionServiceMock: any; // for Csrf only
  let emailVerificationMock: any;
  let coreFcaControllerMock: any;
  let csrfServiceMock: any;
  let loggerMock: any;
  let accountFcaMock: any;
  let coreFcaMock: any;

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
      getInteractionAmr: jest.fn(),
      areThereEssentialAcrRequested: jest.fn(),
      isEssentialAcrSatisfied: jest.fn(),
      computeCanAcrBeSatisfiedByPcf: jest.fn(),
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
    emailVerificationMock = {
      getIsOtpEmailEnabled: jest.fn(),
    };
    csrfServiceMock = {
      getOrCreate: jest.fn(),
    };
    accountFcaMock = {
      getAccountBySub: jest.fn(),
    };
    loggerMock = getLoggerMock();
    coreFcaMock = {
      ensureEmailIsAuthorizedForSp: jest.fn(),
    };

    // Create the testing module
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InteractionController],
      providers: [
        AccountFcaService,
        CoreFcaService,
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
        EmailVerificationService,
      ],
    })
      .overrideProvider(AccountFcaService)
      .useValue(accountFcaMock)
      .overrideProvider(CoreFcaService)
      .useValue(coreFcaMock)
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
      .overrideProvider(EmailVerificationService)
      .useValue(emailVerificationMock)
      .compile();

    controller = module.get<InteractionController>(InteractionController);
    jest.clearAllMocks();
    (validate as jest.Mock).mockReset();
  });

  describe("getVerify()", () => {
    beforeEach(() => {
      accountFcaMock.getAccountBySub.mockResolvedValue({ active: true });
      configServiceMock.get.mockReturnValue({ urlPrefix: "/prefix" });
    });
    it("should successfully complete the interaction when the IdP is active and conditions are satisfied", async () => {
      const req = { sessionId: "session1" } as unknown as Request;
      const res: Partial<Response> = { redirect: jest.fn() };
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1", roles: ["agent_public"] },
          interactionId: "interaction123",
          idpAcr: "high",
          spEssentialAcr: "high",
          spId: "sp123",
          idpId: "idp123",
          idpIdentity: { sub: "user1", extraClaims: "extra" },
        }),
        set: jest.fn(),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;
      const interactionAcr = "high";

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "private" });
      oidcAcrMock.getInteractionAcr.mockReturnValue(interactionAcr);
      oidcProviderMock.finishInteraction.mockResolvedValue(undefined);
      configServiceMock.get.mockReturnValueOnce({
        configuration: { claims: ["sub"] },
      });

      await controller.getVerify(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(oidcAcrMock.getInteractionAcr).toHaveBeenCalledWith({
        idpAcr: "high",
        spEssentialAcr: "high",
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

    it("should call abort interaction when IdP is inactive and in silent authentication mode", async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1" },
          isSilentAuthentication: true,
          idpId: "idp123",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(false);

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(oidcProviderMock.abortInteraction).toHaveBeenCalled();
    });

    it("should redirect to INTERACTION route when IdP is inactive and not in silent authentication mode", async () => {
      const req = { sessionId: "session1" } as unknown as Request;
      const res = { redirect: jest.fn() } as unknown as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1" },
          isSilentAuthentication: false,
          interactionId: "interaction123",
          idpId: "idp123",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(false);
      configServiceMock.get.mockReturnValueOnce({ urlPrefix: "/prefix" });

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(res.redirect).toHaveBeenCalledWith(
        "/prefix/interaction/interaction123",
      );
    });

    it("should throw AgentNotFromPublicServiceException for private sector identity not allowed by SP", async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1", roles: [] },
          spId: "sp123",
          idpId: "idp123",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "public" });

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(AgentNotFromPublicServiceException);
    });

    it("should throw AgentNotFromPublicServiceException for private sector identity not allowed by SP and log error if mismatch", async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1", roles: [] },
          spId: "sp123",
          idpId: "idp123",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "public" });

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(AgentNotFromPublicServiceException);
    });

    it("should throw AgentAccountBlockedException if the account is inactive", async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1" },
          spId: "sp123",
          idpId: "idp123",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;
      accountFcaMock.getAccountBySub.mockResolvedValue({ active: false });

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "public" });

      await expect(
        controller.getVerify(req, res, {} as any, userSessionService),
      ).rejects.toThrow(AgentAccountBlockedException);
    });

    it("should call abort interaction when interactionAcr is not satisfied", async () => {
      const req = { query: {} } as Request;
      const res = {} as Response;
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1", roles: ["agent_public"] },
          spEssentialAcr: "high",
          idpAcr: "low",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "public" });
      oidcAcrMock.getInteractionAcr.mockReturnValue(null);

      await controller.getVerify(req, res, {} as any, userSessionService);

      expect(oidcProviderMock.abortInteraction).toHaveBeenCalled();
    });

    it("should call redirect to email verification if acr satisfiable by Pcf ", async () => {
      const req = { query: {} } as Request;
      const res: Partial<Response> = { redirect: jest.fn() };
      const userSessionService = {
        get: jest.fn().mockReturnValue({
          spIdentity: { sub: "user1", roles: ["agent_public"] },
          spEssentialAcr: "high",
          idpAcr: "low",
        }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      identityProviderMock.isActiveById.mockResolvedValue(true);
      serviceProviderMock.getById.mockResolvedValue({ type: "public" });
      oidcAcrMock.getInteractionAcr.mockReturnValue(null);
      oidcAcrMock.computeCanAcrBeSatisfiedByPcf.mockReturnValue(true);
      emailVerificationMock.getIsOtpEmailEnabled.mockReturnValue(true);

      await controller.getVerify(
        req,
        res as Response,
        {} as any,
        userSessionService,
      );

      expect(res.redirect).toHaveBeenCalledWith("/prefix/verify-email");
    });
  });
});
