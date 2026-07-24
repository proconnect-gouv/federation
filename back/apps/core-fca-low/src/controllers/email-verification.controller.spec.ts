import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { EmailVerificationService } from "@fc/email-verification";
import { LoggerService } from "@fc/logger";
import { ISessionService } from "@fc/session";
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

  beforeEach(async () => {
    emailVerificationMock = {
      sendEmailVerificationIfNeeded: jest.fn(),
      computeCountdownEndDate: jest.fn(),
      computeTokenErrorMessage: jest.fn(),
      verifyEmailToken: jest.fn(),
      deleteEmailTokens: jest.fn(),
    };
    configServiceMock = { get: jest.fn() };
    csrfServiceMock = { getOrCreate: jest.fn() };
    loggerMock = getLoggerMock();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailVerificationController],
      providers: [
        EmailVerificationService,
        ConfigService,
        CsrfService,
        LoggerService,
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
      .compile();

    controller = module.get<EmailVerificationController>(
      EmailVerificationController,
    );
    jest.clearAllMocks();
  });

  describe("getVerifyEmail()", () => {
    it("should render verify-email with verification result", async () => {
      const req = { query: {} } as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ spIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      configServiceMock.get.mockReturnValue({
        fromEmail: "noreply@example.com",
      });
      csrfServiceMock.getOrCreate.mockReturnValue("csrf-token");
      emailVerificationMock.sendEmailVerificationIfNeeded.mockResolvedValue({
        hasSentVerificationEmail: true,
        lastTokenSentAt: new Date("2024-01-01T00:00:00.000Z"),
      });
      emailVerificationMock.computeCountdownEndDate.mockReturnValue(
        new Date("2024-01-01T01:00:00.000Z"),
      );
      emailVerificationMock.computeTokenErrorMessage.mockReturnValue(undefined);

      await controller.getVerifyEmail(req, res as Response, userSession);

      expect(
        emailVerificationMock.sendEmailVerificationIfNeeded,
      ).toHaveBeenCalledWith("user@example.com");
      expect(
        emailVerificationMock.computeCountdownEndDate,
      ).toHaveBeenCalledWith(new Date("2024-01-01T00:00:00.000Z"));
      expect(
        emailVerificationMock.computeTokenErrorMessage,
      ).toHaveBeenCalledWith(undefined);
      expect(res.render).toHaveBeenCalledWith("verify-email", {
        csrfToken: "csrf-token",
        fromEmail: "noreply@example.com",
        hasSentVerificationEmail: true,
        countdownEndDate: "2024-01-01T01:00:00.000Z",
        errorMessage: undefined,
      });
    });

    it("should render verify-email even when no email was sent", async () => {
      const req = {
        query: { error: "invalid_email" },
      } as unknown as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ spIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      configServiceMock.get.mockReturnValue({
        fromEmail: "noreply@example.com",
      });
      csrfServiceMock.getOrCreate.mockReturnValue("csrf-token");
      emailVerificationMock.sendEmailVerificationIfNeeded.mockResolvedValue({
        hasSentVerificationEmail: false,
        lastTokenSentAt: null,
      });
      emailVerificationMock.computeCountdownEndDate.mockReturnValue(
        new Date("2024-01-01T00:00:00.000Z"),
      );
      emailVerificationMock.computeTokenErrorMessage.mockReturnValue(
        "Email invalide",
      );

      await controller.getVerifyEmail(req, res as Response, userSession);

      expect(res.render).toHaveBeenCalledWith(
        "verify-email",
        expect.objectContaining({
          csrfToken: "csrf-token",
          fromEmail: "noreply@example.com",
          hasSentVerificationEmail: false,
          countdownEndDate: "2024-01-01T00:00:00.000Z",
          errorMessage: "Email invalide",
        }),
      );
    });

    it("should render an error message when the email verification service throws", async () => {
      const req = { query: {} } as Request;
      const res = { render: jest.fn() } as unknown as Response;
      const userSession = {
        get: jest
          .fn()
          .mockReturnValue({ spIdentity: { email: "user@example.com" } }),
      } as unknown as ISessionService<AfterGetOidcCallbackSessionDto>;

      configServiceMock.get.mockReturnValue({
        fromEmail: "noreply@example.com",
      });
      csrfServiceMock.getOrCreate.mockReturnValue("csrf-token");
      emailVerificationMock.sendEmailVerificationIfNeeded.mockRejectedValue(
        new Error("boom"),
      );

      await controller.getVerifyEmail(req, res as Response, userSession);

      expect(loggerMock.error).toHaveBeenCalledWith({
        code: "email-verification-service-send-email-error",
        emailVerificationSendError: expect.any(Error),
        emailVerificationSendErrorCause: undefined,
        emailVerificationSendErrorType: "Error",
      });
      expect(res.render).toHaveBeenCalledWith("verify-email", {
        csrfToken: "csrf-token",
        hasSentVerificationEmail: false,
        errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
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
      emailVerificationMock.verifyEmailToken.mockResolvedValue({
        isTokenValid: true,
      });

      await controller.postVerifyEmail(res as Response, body, userSession);

      expect(emailVerificationMock.verifyEmailToken).toHaveBeenCalledWith(
        "user@example.com",
        "0123456789",
      );
      expect(userSession.set).toHaveBeenCalledWith({
        isEmailVerifiedByPcf: true,
      });
      expect(userSession.commit).toHaveBeenCalled();
      expect(emailVerificationMock.deleteEmailTokens).toHaveBeenCalledWith(
        "user@example.com",
      );
      expect(res.redirect).toHaveBeenCalledWith(
        "/prefix/interaction/interaction123/verify",
      );
    });

    it("should redirect back to verify-email with an error when token is invalid", async () => {
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
      emailVerificationMock.verifyEmailToken.mockResolvedValue({
        isTokenValid: false,
        error: "invalid_email",
      });

      await controller.postVerifyEmail(res as Response, body, userSession);

      expect(userSession.set).not.toHaveBeenCalled();
      expect(userSession.commit).not.toHaveBeenCalled();
      expect(emailVerificationMock.deleteEmailTokens).not.toHaveBeenCalled();
      expect(res.redirect).toHaveBeenCalledWith(
        "/prefix/verify-email?error=invalid_email",
      );
    });
  });
});
