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
import { InvalidEmailVerificationTokenException } from "./exceptions";
import { EmailVerificationTokenRepository } from "./repositories";
import { EmailVerificationToken } from "./schemas";

describe(EmailVerificationService.name, () => {
  let service: EmailVerificationService;

  const mailerServiceMock = {
    sendMail: jest.fn(),
  };
  const emailVerificationRepositoryMock = {
    findOne: jest.fn(),
    upsert: jest.fn(),
    deleteOne: jest.fn(),
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
            isOtpEmailEnabled: true,
            tokenExpirationDurationInMs: 60 * 60 * 1000,
            verificationEmailCooldownBeforeResendInMs: 10 * 60 * 1000,
          };
        default:
          return {};
      }
    });

    csrfServiceMock.getOrCreate.mockReturnValue("csrf-token");

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        LoggerService,
        MailerService as Provider<MailerService>,
        RateLimiterService,
        ConfigService,
        EmailVerificationTokenRepository,
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
      .overrideProvider(EmailVerificationTokenRepository)
      .useValue(emailVerificationRepositoryMock)
      .compile();

    service = app.get<EmailVerificationService>(EmailVerificationService);
  });

  describe("verifyEmailToken", () => {
    it("should return invalid_verify_email_code when token is not found", async () => {
      rateLimiterServiceMock.consume.mockResolvedValue(undefined);
      emailVerificationRepositoryMock.findOne.mockResolvedValue(null);

      expect(
        service.verifyEmailToken("user@example.com", "1234567890"),
      ).rejects.toThrow(InvalidEmailVerificationTokenException);
    });
  });

  describe("computeShouldSendEmail", () => {
    it("should return true when token is expired", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T01:00:01.000Z"));
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      emailVerificationRepositoryMock.findOne.mockResolvedValue(
        lastEmailVerificationToken,
      );

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
      jest.useRealTimers();
    });

    it("should return false when token is not past cooldown but user requested", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:05:00.000Z"));
      const lastEmailVerificationToken = {
        sentAt: new Date("2024-01-01T00:00:00.000Z"),
      } as EmailVerificationToken;
      emailVerificationRepositoryMock.findOne.mockResolvedValue(
        lastEmailVerificationToken,
      );

      const result = await service.sendEmailVerificationIfNeeded(
        "user@example.com",
        { requestSendEmail: true },
      );

      expect(result.hasSentVerificationEmail).toBe(false);
      jest.useRealTimers();
    });
  });

  describe("getValidityDuration", () => {
    it("should return the validity duration in minutes if < 60 minutes", () => {
      configServiceMock.get.mockReturnValue({
        tokenExpirationDurationInMs: 30 * 60 * 1000,
      });
      const result = service.getValidityDuration();

      expect(result).toBe("30 minutes");
    });

    it("should return the validity duration in hours if >= 60 minutes", () => {
      configServiceMock.get.mockReturnValue({
        tokenExpirationDurationInMs: 90 * 60 * 1000,
      });
      const result = service.getValidityDuration();

      expect(result).toBe("1 heure 30");
    });

    it("should return the validity duration in hours with plural if >= 2 hours", () => {
      configServiceMock.get.mockReturnValue({
        tokenExpirationDurationInMs: 2 * 60 * 60 * 1000,
      });
      const result = service.getValidityDuration();

      expect(result).toBe("2 heures");
    });
  });
});
