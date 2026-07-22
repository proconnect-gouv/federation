import { AppConfig } from "@fc/app";
import { ConfigService } from "@fc/config";
import { LoggerService } from "@fc/logger";
import { MailerService } from "@fc/mailer";
import { RateLimiterService } from "@fc/rate-limiter";
import { RateLimiterKeyPrefix } from "@fc/rate-limiter/enum";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { VerifyEmail } from "@proconnect-gouv/proconnect.email";
import { Model } from "mongoose";
import { customAlphabet } from "nanoid";
import { EmailVerificationConfig } from "./dto";
import { EmailVerificationToken } from "./schemas";

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly mailer: MailerService,
    @InjectModel("EmailVerificationToken")
    private model: Model<EmailVerificationToken>,
    private readonly config: ConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly logger: LoggerService,
  ) {}

  computeIsEmailEligible(email: string): boolean {
    const { eligibleEmailsPercentage } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    return email.length % 10 < (eligibleEmailsPercentage / 100) * 10;
  }

  computeCountdownEndDate(lastTokenSentAt: Date | undefined): Date {
    const { verificationEmailWaitingDurationBeforeResendInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    if (!lastTokenSentAt) {
      const now = new Date();
      return new Date(
        now.getTime() + verificationEmailWaitingDurationBeforeResendInMs,
      );
    }
    return new Date(
      lastTokenSentAt.getTime() +
        verificationEmailWaitingDurationBeforeResendInMs,
    );
  }

  async sendEmailVerificationIfNeeded(email: string) {
    const lastEmailVerificationToken = await this.model
      .findOne({
        email,
      })
      .sort({ sentAt: -1 });

    const shouldSendEmail = await this.computeShouldSendEmail(
      lastEmailVerificationToken?.sentAt,
    );

    if (!shouldSendEmail) {
      return {
        hasSentVerificationEmail: false,
        lastTokenSentAt: lastEmailVerificationToken?.sentAt,
      };
    }

    await this.deleteEmailTokens(email);
    const token = this.generateToken();

    const now = new Date();

    try {
      await this.sendVerificationMail(email, token);
    } catch (err: any) {
      this.logger.error({
        code: "email-verification-service-send-verification-mail-error",
        emailVerificationSendError: err,
        emailVerificationSendErrorCause: err?.cause,
        emailVerificationSendErrorType: err?.constructor?.name,
      });
      throw err;
    }

    await this.model.create({
      email,
      token,
      sentAt: now,
    });

    return {
      hasSentVerificationEmail: true,
      lastTokenSentAt: now,
    };
  }

  async sendVerificationMail(email: string, token: string) {
    const { fqdn } = this.config.get<AppConfig>("App");
    this.logger.info({
      code: "send-verification-mail",
      email,
    });

    await this.mailer.sendMail({
      to: email,
      subject: "Vérification de votre adresse email",
      htmlContent: VerifyEmail({
        baseurl: fqdn || "",
        token,
      }).toString(),
    });
    return;
  }

  private async computeShouldSendEmail(
    lastTokenSentAt?: Date,
  ): Promise<boolean> {
    if (!lastTokenSentAt) {
      return true;
    }
    const now = new Date();
    const {
      tokenExpirationDurationInMs,
      verificationEmailWaitingDurationBeforeResendInMs,
    } = this.config.get<EmailVerificationConfig>("EmailVerification");

    const isTokenExpired =
      now.getTime() - lastTokenSentAt.getTime() > tokenExpirationDurationInMs;
    if (isTokenExpired) {
      return true;
    }
    if (
      lastTokenSentAt.getTime() +
        verificationEmailWaitingDurationBeforeResendInMs >
      now.getTime()
    ) {
      return false;
    }
    return true;
  }

  async verifyEmailToken(email: string, token: string) {
    try {
      await this.rateLimiter.consume(
        RateLimiterKeyPrefix.VERIFY_EMAIL_TOKEN,
        email,
      );
    } catch (err: any) {
      this.logger.error({
        code: "email-verification-service-verify-email-token-rate-limiter-error",
        emailVerificationSendError: err,
        emailVerificationSendErrorCause: err?.cause,
        emailVerificationSendErrorType: err?.constructor?.name,
      });
      return { isTokenValid: false, error: "too_many_attempts" };
    }
    const { tokenExpirationDurationInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    const expirationTimeThreshold = new Date(
      Date.now() - tokenExpirationDurationInMs,
    );
    const emailVerificationToken = await this.model.findOne({
      email,
      token,
      sentAt: { $gte: expirationTimeThreshold },
    });
    if (!emailVerificationToken) {
      return { isTokenValid: false, error: "invalid_verify_email_code" };
    }
    return { isTokenValid: true };
  }

  computeTokenErrorMessage(errorCode: string | undefined) {
    if (!errorCode) {
      return undefined;
    }
    switch (errorCode) {
      case "invalid_verify_email_code":
        return "Le code rentré est invalide ou expiré.";
      case "too_many_attempts":
        return "Vous avez fait trop de tentatives, veuillez réessayer plus tard.";
      default:
        return "Une erreur est survenue, veuillez réessayer.";
    }
  }

  deleteEmailTokens(email: string) {
    return this.model.deleteMany({ email });
  }

  private generateToken(): string {
    return customAlphabet("0123456789", 10)();
  }
}
