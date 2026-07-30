import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { LoggerService } from "@fc/logger";
import { MailerService } from "@fc/mailer";
import { RateLimiterService } from "@fc/rate-limiter";
import { getConfigMock } from "@mocks/config";
import { getLoggerMock } from "@mocks/logger";
import { Provider } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EmailVerificationService } from "./email-verification.service";
import {
  InvalidEmailVerificationTokenException,
  SendEmailFailureException,
  TooManyAttemptsException,
} from "./exceptions";
import { EmailVerificationToken } from "./schemas";

describe(EmailVerificationService.name, () => {
  let service: EmailVerificationService;

  const mailerServiceMock = {
    sendMail: jest.fn(),
  };
  const modelMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteOne: jest.fn(),
    findOneAndUpdate: jest.fn(),
  };
  const csrfServiceMock = {
    getOrCreate: jest.fn(),
  };
  const configServiceMock = getConfigMock();
  const rateLimiterServiceMock = {
    consume: jest.fn(),
    reset: jest.fn(),
  };
  const loggerServiceMock = getLoggerMock();

  beforeEach(async () => {
    jest.resetAllMocks();
    jest.restoreAllMocks();

    configServiceMock.get.mockImplementation((key: string) => {
      switch (key) {
        case "App":
          return {
            fqdn: "https://example.org",
          };
        case "EmailVerification":
          return {
            eligibleEmailsPercentage: 100,
            tokenExpirationDurationInMs: 60 * 60 * 1000,
            verificationEmailWaitingDurationBeforeResendInMs: 10 * 60 * 1000,
          };
        default:
          return {};
      }
    });

    modelMock.findOne.mockReturnValue({
      sort: jest.fn().mockResolvedValue(null),
    });

    csrfServiceMock.getOrCreate.mockReturnValue("csrf-token");

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        LoggerService,
        MailerService as Provider<MailerService>,
        RateLimiterService,
        ConfigService,
        { provide: "EmailVerificationTokenModel", useValue: modelMock },
        CsrfService,
      ],
    })
      .overrideProvider(LoggerService)
      .useValue(loggerServiceMock)
      .overrideProvider(MailerService)
      .useValue(mailerServiceMock)
      .overrideProvider(RateLimiterService)
      .useValue(rateLimiterServiceMock)
      .overrideProvider(ConfigService)
      .useValue(configServiceMock)
      .overrideProvider(CsrfService)
      .useValue(csrfServiceMock)
      .compile();

    service = app.get<EmailVerificationService>(EmailVerificationService);
  });

  describe("computeCountdownEndDate", () => {
    it("should return threshold from now when no date is provided", () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      const result = service.computeCountdownEndDate(undefined);

      expect(result).toEqual(new Date("2024-01-01T00:10:00.000Z"));
      jest.useRealTimers();
    });

    it("should return threshold from last token date", () => {
      const lastEmailVerificationTokenSentAt = new Date(
        "2024-01-01T00:00:00.000Z",
      );

      const result = service.computeCountdownEndDate(
        lastEmailVerificationTokenSentAt,
      );

      expect(result).toEqual(new Date("2024-01-01T00:10:00.000Z"));
    });
  });

  describe("computeIsEmailEligible", () => {
    beforeEach(() => {
      configServiceMock.get.mockReturnValue({
        eligibleEmailsPercentage: 10,
      });
    });
    it("should return true when email is eligible", () => {
      const result = service.computeIsEmailEligible("aaaaaaaa@example.com");
      expect(result).toBe(true);
    });

    it("should return false when email is not eligible", () => {
      const result = service.computeIsEmailEligible("user@example.com");
      expect(result).toBe(false);
    });
  });

  describe("sendEmailVerificationIfNeeded", () => {
    it("should return false when email has just been sent", async () => {
      const now = new Date("2024-01-01T00:01:00.000Z");
      jest.useFakeTimers().setSystemTime(now);
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(lastEmailVerificationToken),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result).toEqual({
        hasSentVerificationEmail: false,
      });
      expect(mailerServiceMock.sendMail).not.toHaveBeenCalled();
    });

    it("should send verification email and create a token when needed", async () => {
      const now = new Date("2024-01-01T12:00:00.000Z");
      jest.useFakeTimers().setSystemTime(now);

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result).toEqual({
        hasSentVerificationEmail: true,
      });
      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Vérification de votre adresse email",
          htmlContent: expect.any(String),
        }),
      );
      expect(modelMock.findOneAndUpdate).toHaveBeenCalled();
      jest.useRealTimers();
    });

    it("should throw and log when sendMail throws an error", async () => {
      const now = new Date("2024-01-01T12:00:00.000Z");
      jest.useFakeTimers().setSystemTime(now);

      mailerServiceMock.sendMail.mockRejectedValue(new Error("send failed"));

      await expect(
        service.sendEmailVerificationIfNeeded("user@example.com"),
      ).rejects.toThrow(SendEmailFailureException);

      jest.useRealTimers();
    });
  });

  describe("sendVerificationMail", () => {
    it("should send a verification email", async () => {
      await service.sendVerificationMail("user@example.com", "1234567890");

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Vérification de votre adresse email",
        }),
      );
    });

    it("should send a verification email even if fqdn not defined", async () => {
      configServiceMock.get.mockReturnValue({
        fqdn: undefined,
      });

      await service.sendVerificationMail("user@example.com", "1234567890");

      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Vérification de votre adresse email",
        }),
      );
    });
  });

  describe("verifyEmailToken", () => {
    it("should return too_many_attempts when rate limiter rejects", async () => {
      rateLimiterServiceMock.consume.mockRejectedValue(
        new Error("rate limited"),
      );

      expect(
        service.verifyEmailToken("user@example.com", "1234567890"),
      ).rejects.toThrow(TooManyAttemptsException);
    });

    it("should return invalid_verify_email_code when token is not found", async () => {
      rateLimiterServiceMock.consume.mockResolvedValue(undefined);
      modelMock.findOne.mockResolvedValue(null);

      expect(
        service.verifyEmailToken("user@example.com", "1234567890"),
      ).rejects.toThrow(InvalidEmailVerificationTokenException);
    });

    it("should not throw when token is valid", async () => {
      const now = new Date("2024-01-01T00:01:00.000Z");
      jest.useFakeTimers().setSystemTime(now);

      rateLimiterServiceMock.consume.mockResolvedValue(undefined);
      modelMock.findOne.mockResolvedValue({
        email: "user@example.com",
        token: "1234567890",
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      });

      await expect(
        service.verifyEmailToken("user@example.com", "1234567890"),
      ).resolves.not.toThrow();
      jest.useRealTimers();
    });
  });

  describe("renderVerificationEmailTemplate", () => {
    it("should render verify-email template with csrf token and computed countdown date", async () => {
      const lastEmailVerificationTokenSentAt = new Date(
        "2024-01-01T00:00:00.000Z",
      );
      modelMock.findOne.mockReturnValue({
        sort: jest
          .fn()
          .mockResolvedValue({ sentAt: lastEmailVerificationTokenSentAt }),
      });

      const render = jest.fn();
      const res = { render } as any;

      await service.renderVerificationEmailTemplate(res, {
        email: "user@example.com",
        hasSentVerificationEmail: true,
        errorMessage: "Une erreur",
      });

      expect(render).toHaveBeenCalledWith("verify-email", {
        csrfToken: "csrf-token",
        email: "user@example.com",
        hasSentVerificationEmail: true,
        countdownEndDate: "2024-01-01T00:10:00.000Z",
        errorMessage: "Une erreur",
      });
    });
  });

  describe("computeShouldSendEmail", () => {
    it("should return true when there is no previous token", async () => {
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(null),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
    });

    it("should return true when token is expired", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T01:00:01.000Z"));
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(lastEmailVerificationToken),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
      jest.useRealTimers();
    });

    it("should return false when token is still within threshold", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:05:00.000Z"));
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(lastEmailVerificationToken),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(false);
      jest.useRealTimers();
    });

    it("should return true when token is past threshold", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:11:00.000Z"));
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockResolvedValue(lastEmailVerificationToken),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
      jest.useRealTimers();
    });
  });

  describe("deleteEmailToken", () => {
    it("should call deleteOne", async () => {
      const email = "user@example.com";

      await service.deleteEmailToken(email);

      expect(modelMock.deleteOne).toHaveBeenCalledWith({ email });
    });
  });
});
