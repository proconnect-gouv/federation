import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { EmailVerificationService } from "@fc/email-verification";
import { LoggerService } from "@fc/logger";
import { ISessionService, SessionService } from "@fc/session";
import { getLoggerMock } from "@mocks/logger";
import { Test, TestingModule } from "@nestjs/testing";
import { Request, Response } from "express";
import { AfterGetOidcCallbackSessionDto, VerifyEmailDto } from "../dto";
import { EmailVerificationController } from "./email-verification.controller";

describe("EmailVerificationController", () => {
  let controller: EmailVerificationController;

  let emailVerificationMock: any;
  let configServiceMock: any;
  let csrfServiceMock: any;
  let loggerMock: any;
  let sessionServiceMock: any;

  beforeEach(async () => {
    emailVerificationMock = {
      sendEmailVerificationIfNeeded: jest.fn(),
      verifyEmailToken: jest.fn(),
      deleteEmailTokens: jest.fn(),
      findLastEmailVerificationToken: jest.fn(),
      renderVerificationEmailTemplate: jest.fn(),
    };
    configServiceMock = { get: jest.fn() };
    csrfServiceMock = { getOrCreate: jest.fn() };
    sessionServiceMock = { get: jest.fn() };
    loggerMock = getLoggerMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailVerificationController],
      providers: [
        EmailVerificationService,
        ConfigService,
        CsrfService,
        LoggerService,
        SessionService,
      ],
    })
      .overrideProvider(EmailVerificationService)
      .useValue(emailVerificationMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CsrfService)
      .useValue(csrfServiceMock)
      .overrideProvider(LoggerService)
      .useValue(loggerMock)
      .overrideProvider(SessionService)
      .useValue(sessionServiceMock)
      .compile();

    controller = module.get<EmailVerificationController>(
      EmailVerificationController,
    );
    jest.clearAllMocks();
  });

  describe("getVerifyEmail()", () => {
    it("should render verify-email template with verification result", async () => {
      const res = {} as Response;
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ spIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      emailVerificationMock.sendEmailVerificationIfNeeded.mockResolvedValue({
        hasSentVerificationEmail: true,
      });

      await controller.getVerifyEmail({} as Request, res, userSession);

      expect(
        emailVerificationMock.renderVerificationEmailTemplate,
      ).toHaveBeenCalledWith(res, {
        email: "user@example.com",
        hasSentVerificationEmail: true,
      });
    });

    it("should render verify-email even when no email was sent", async () => {
      const res = { render: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ spIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      emailVerificationMock.sendEmailVerificationIfNeeded.mockResolvedValue({
        hasSentVerificationEmail: false,
      });

      await controller.getVerifyEmail({} as Request, res, userSession);

      expect(
        emailVerificationMock.renderVerificationEmailTemplate,
      ).toHaveBeenCalledWith(res, {
        email: "user@example.com",
        hasSentVerificationEmail: false,
      });
    });
  });

  describe("postVerifyEmail()", () => {
    it("should redirect to interaction verify after a valid token", async () => {
      const res = { redirect: jest.fn() } as unknown as Response;
      const body: VerifyEmailDto = {
        verify_email_token: "0123456789",
        csrfToken: "",
      };
      const userSession = {
        get: jest.fn().mockReturnValue({
          spIdentity: { email: "user@example.com" },
          interactionId: "interaction123",
        }),
        set: jest.fn(),
        commit: jest.fn(),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;
      configServiceMock.get.mockReturnValue({ urlPrefix: "/prefix" });

      await controller.postVerifyEmail(res as Response, body, userSession);

      expect(res.redirect).toHaveBeenCalledWith(
        "/prefix/interaction/interaction123/verify",
      );
    });
  });
});
