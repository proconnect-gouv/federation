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
import { EmailVerificationToken } from "./schemas";

@Injectable()
export class EmailVerificationService {
  TOKEN_EXPIRATION_TIME = 60 * 60 * 1000; // 1 hour in milliseconds
  VERIFICATION_EMAIL_THRESHOLD = 10 * 60 * 1000; // 10 minutes in milliseconds

  constructor(
    private readonly mailer: MailerService,
    @InjectModel("EmailVerificationToken")
    private model: Model<EmailVerificationToken>,
    private readonly config: ConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly logger: LoggerService,
  ) {}

  computeCanAcrBeSatisfiedByPcf({
    spEssentialAcr,
    amr,
    email,
  }: {
    spEssentialAcr?: string;
    amr?: string[];
    email: string;
  }) {
    const { verificationEmailPercentage } = this.config.get<AppConfig>("App");
    const isEmailEligible =
      email.length % 10 < (verificationEmailPercentage / 100) * 10; // We only redirect a certain percentage of users to the email verification flow to warm up the e-mail account
    const spEssentialAcrValues = spEssentialAcr?.split(" ") || [];
    return (
      spEssentialAcrValues.includes("eidas1-mfa") &&
      !amr?.includes("mail") &&
      isEmailEligible
    );
  }

  computeCountdownEndDate(lastTokenSentAt: Date | undefined): Date {
    if (!lastTokenSentAt) {
      const now = new Date();
      return new Date(now.getTime() + this.VERIFICATION_EMAIL_THRESHOLD);
    }
    return new Date(
      lastTokenSentAt.getTime() + this.VERIFICATION_EMAIL_THRESHOLD,
    );
  }

  async sendEmailVerificationIfNeeded(email: string) {
    const lastEmailVerificationToken =
      await this.findLastEmailVerificationToken(email);

    const shouldSendEmail = await this.computeShouldSendEmail(
      lastEmailVerificationToken?.sentAt,
    );

    if (!shouldSendEmail) {
      return {
        hasSentVerificationEmail: false,
        lastTokenSentAt: lastEmailVerificationToken?.sentAt,
      };
    }

    const token = await this.resetEmailVerificationTokens(email);

    const now = new Date();

    await this.sendVerificationMail(email, token);

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

  computeIsTokenExpired(sentAt: Date): boolean {
    const now = new Date();
    const timeSinceLastPinSent = now.getTime() - sentAt.getTime();

    return timeSinceLastPinSent > this.TOKEN_EXPIRATION_TIME;
  }

  private async resetEmailVerificationTokens(email: string): Promise<string> {
    await this.deleteEmailTokens(email);
    await this.rateLimiter.reset(
      RateLimiterKeyPrefix.VERIFY_EMAIL_TOKEN,
      email,
    );
    const token = this.generateToken();
    return token;
  }

  private async findLastEmailVerificationToken(
    email: string,
  ): Promise<EmailVerificationToken | null> {
    const emailVerificationToken = await this.model
      .findOne({
        email,
      })
      .sort({ sentAt: -1 })
      .exec();
    return emailVerificationToken;
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
    const expirationTimeThreshold = new Date(
      Date.now() - this.TOKEN_EXPIRATION_TIME,
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

  private async computeShouldSendEmail(
    lastTokenSentAt?: Date,
  ): Promise<boolean> {
    if (!lastTokenSentAt) {
      return true;
    }

    const isTokenExpired = this.computeIsTokenExpired(lastTokenSentAt);
    if (isTokenExpired) {
      return true;
    }
    const now = new Date();
    if (
      lastTokenSentAt.getTime() + this.VERIFICATION_EMAIL_THRESHOLD >
      now.getTime()
    ) {
      return false;
    }
    return true;
  }
}
