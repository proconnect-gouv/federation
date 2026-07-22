import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { MailerService } from "@fc/mailer";
import { RateLimiterService } from "@fc/rate-limiter";
import { getConfigMock } from "@mocks/config";
import { getLoggerMock } from "@mocks/logger";
import { Provider } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { EmailVerificationService } from "./email-verification.service";

describe(EmailVerificationService.name, () => {
  let service: EmailVerificationService;

  const mailerServiceMock = {
    sendMail: jest.fn(),
  };
  const modelMock = {
    create: jest.fn(),
    findOne: jest.fn(),
    deleteMany: jest.fn(),
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
      if (key === "App") {
        return {
          verificationEmailPercentage: 100,
          fqdn: "https://example.org",
        };
      }
      return {};
    });

    modelMock.findOne.mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    const app: TestingModule = await Test.createTestingModule({
      providers: [
        EmailVerificationService,
        LoggerService,
        MailerService as Provider<MailerService>,
        RateLimiterService,
        ConfigService,
        { provide: "EmailVerificationTokenModel", useValue: modelMock },
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
      .compile();

    service = app.get<EmailVerificationService>(EmailVerificationService);
  });

  describe("computeCanAcrBeSatisfiedByPcf", () => {
    it("should return true when all conditions are met", () => {
      configServiceMock.get.mockReturnValue({
        verificationEmailPercentage: 100,
      });

      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "openid eidas1-mfa",
        amr: ["pwd"],
        email: "user@example.com",
      });

      expect(result).toBe(true);
    });

    it("should return false when eidas1-mfa is missing", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "openid",
        amr: ["pwd"],
        email: "user@example.com",
      });

      expect(result).toBe(false);
    });
    it("should return false when spEssentialAcr is empty", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: undefined,
        amr: ["pwd"],
        email: "user@example.com",
      });

      expect(result).toBe(false);
    });

    it("should return false when amr contains mail", () => {
      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "eidas1-mfa",
        amr: ["mail"],
        email: "user@example.com",
      });

      expect(result).toBe(false);
    });

    it("should return false when email is not eligible", () => {
      configServiceMock.get.mockReturnValue({ verificationEmailPercentage: 0 });

      const result = service.computeCanAcrBeSatisfiedByPcf({
        spEssentialAcr: "eidas1-mfa",
        amr: [],
        email: "user@example.com",
      });

      expect(result).toBe(false);
    });
  });

  describe("computeCountdownEndDate", () => {
    it("should return threshold from now when no date is provided", () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:00:00.000Z"));

      const result = service.computeCountdownEndDate(undefined);

      expect(result).toEqual(new Date("2024-01-01T00:10:00.000Z"));
      jest.useRealTimers();
    });

    it("should return threshold from last token date", () => {
      const lastTokenSentAt = new Date("2024-01-01T00:00:00.000Z");

      const result = service.computeCountdownEndDate(lastTokenSentAt);

      expect(result).toEqual(new Date("2024-01-01T00:10:00.000Z"));
    });
  });

  describe("sendEmailVerificationIfNeeded", () => {
    it("should return false when email has just been sent", async () => {
      const now = new Date("2024-01-01T00:01:00.000Z");
      jest.useFakeTimers().setSystemTime(now);
      const lastTokenSentAt = new Date("2024-01-01T00:00:00.000Z");
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ sentAt: lastTokenSentAt }),
        }),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result).toEqual({
        hasSentVerificationEmail: false,
        lastTokenSentAt,
      });
      expect(mailerServiceMock.sendMail).not.toHaveBeenCalled();
      expect(modelMock.create).not.toHaveBeenCalled();
    });

    it("should send verification email and create a token when needed", async () => {
      const now = new Date("2024-01-01T12:00:00.000Z");
      jest.useFakeTimers().setSystemTime(now);

      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result).toEqual({
        hasSentVerificationEmail: true,
        lastTokenSentAt: now,
      });
      expect(service.sendVerificationMail).toBeDefined();
      expect(mailerServiceMock.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Vérification de votre adresse email",
          htmlContent: expect.any(String),
        }),
      );
      expect(modelMock.create).toHaveBeenCalledWith({
        email: "user@example.com",
        token: expect.any(String),
        sentAt: now,
      });
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

  describe("computeIsTokenExpired", () => {
    it("should return true when the token is expired", () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T01:00:01.000Z"));

      const result = service.computeIsTokenExpired(
        new Date("2024-01-01T00:00:00.000Z"),
      );

      expect(result).toBe(true);
      jest.useRealTimers();
    });

    it("should return false when the token is not expired", () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:30:00.000Z"));

      const result = service.computeIsTokenExpired(
        new Date("2024-01-01T00:00:00.000Z"),
      );

      expect(result).toBe(false);
      jest.useRealTimers();
    });
  });

  describe("verifyEmailToken", () => {
    it("should return too_many_attempts when rate limiter rejects", async () => {
      rateLimiterServiceMock.consume.mockRejectedValue(
        new Error("rate limited"),
      );

      const result = await service.verifyEmailToken(
        "user@example.com",
        "1234567890",
      );

      expect(result).toEqual({
        isTokenValid: false,
        error: "too_many_attempts",
      });
      expect(loggerServiceMock.error).toHaveBeenCalled();
    });

    it("should return invalid_verify_email_code when token is not found", async () => {
      rateLimiterServiceMock.consume.mockResolvedValue(undefined);
      modelMock.findOne.mockResolvedValue(null);

      const result = await service.verifyEmailToken(
        "user@example.com",
        "1234567890",
      );

      expect(result).toEqual({
        isTokenValid: false,
        error: "invalid_verify_email_code",
      });
      expect(modelMock.findOne).toHaveBeenCalled();
    });

    it("should return true when token is valid", async () => {
      rateLimiterServiceMock.consume.mockResolvedValue(undefined);
      modelMock.findOne.mockResolvedValue({
        email: "user@example.com",
        token: "1234567890",
      });

      const result = await service.verifyEmailToken(
        "user@example.com",
        "1234567890",
      );

      expect(result).toEqual({ isTokenValid: true });
    });
  });

  describe("computeTokenErrorMessage", () => {
    it("should return undefined when no error code is provided", () => {
      expect(service.computeTokenErrorMessage(undefined)).toBeUndefined();
    });

    it("should return a message for invalid_verify_email_code", () => {
      expect(
        service.computeTokenErrorMessage("invalid_verify_email_code"),
      ).toBe("Le code rentré est invalide ou expiré.");
    });

    it("should return a message for too_many_attempts", () => {
      expect(service.computeTokenErrorMessage("too_many_attempts")).toBe(
        "Vous avez fait trop de tentatives, veuillez réessayer plus tard.",
      );
    });

    it("should return default message for unknown error code", () => {
      expect(service.computeTokenErrorMessage("unknown")).toBe(
        "Une erreur est survenue, veuillez réessayer.",
      );
    });
  });

  describe("deleteEmailTokens", () => {
    it("should delete email tokens", async () => {
      await service.deleteEmailTokens("user@example.com");

      expect(modelMock.deleteMany).toHaveBeenCalledWith({
        email: "user@example.com",
      });
    });
  });

  describe("computeShouldSendEmail", () => {
    it("should return true when there is no previous token", async () => {
      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
    });

    it("should return true when token is expired", async () => {
      const lastTokenSentAt = new Date("2024-01-01T00:00:00.000Z");
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T01:00:01.000Z"));
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ sentAt: lastTokenSentAt }),
        }),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
      jest.useRealTimers();
    });

    it("should return false when token is still within threshold", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:05:00.000Z"));
      const lastTokenSentAt = new Date("2024-01-01T00:00:00.000Z");
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ sentAt: lastTokenSentAt }),
        }),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(false);
      jest.useRealTimers();
    });

    it("should return true when token is past threshold", async () => {
      jest.useFakeTimers().setSystemTime(new Date("2024-01-01T00:11:00.000Z"));
      const lastTokenSentAt = new Date("2024-01-01T00:00:00.000Z");
      modelMock.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue({ sentAt: lastTokenSentAt }),
        }),
      });

      const result =
        await service.sendEmailVerificationIfNeeded("user@example.com");

      expect(result.hasSentVerificationEmail).toBe(true);
      jest.useRealTimers();
    });
  });
});
