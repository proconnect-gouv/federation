import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { LoggerService } from "@fc/logger";
import { MailerService } from "@fc/mailer";
import { RateLimiterService } from "@fc/rate-limiter";
import { RateLimiterKeyPrefix } from "@fc/rate-limiter/enum";
import { Injectable } from "@nestjs/common";
import { OtpEmail } from "@proconnect-gouv/proconnect.email";
import { Response } from "express";
import { customAlphabet } from "nanoid";
import { EmailVerificationConfig } from "./dto";
import {
  InvalidEmailVerificationTokenException,
  SendEmailFailureException,
  TooManyAttemptsException,
} from "./exceptions";
import { EmailVerificationTokenRepository } from "./repositories";

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly emailVerificationTokenRepository: EmailVerificationTokenRepository,
    private readonly mailer: MailerService,
    private readonly config: ConfigService,
    private readonly rateLimiter: RateLimiterService,
    private readonly logger: LoggerService,
    private readonly csrfService: CsrfService,
  ) {}

  getIsOtpEmailEnabled(): boolean {
    const { isOtpEmailEnabled } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    return isOtpEmailEnabled;
  }

  computeCountdownEndDate(
    lastEmailVerificationTokenSentAt: Date | undefined,
  ): Date {
    const { verificationEmailCooldownBeforeResendInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    if (!lastEmailVerificationTokenSentAt) {
      const now = new Date();
      return new Date(
        now.getTime() + verificationEmailCooldownBeforeResendInMs,
      );
    }
    return new Date(
      lastEmailVerificationTokenSentAt.getTime() +
        verificationEmailCooldownBeforeResendInMs,
    );
  }

  async sendEmailVerificationIfNeeded(
    email: string,
    options?: { requestSendEmail?: boolean },
  ): Promise<{ hasSentVerificationEmail: boolean }> {
    const lastEmailVerificationToken =
      await this.emailVerificationTokenRepository.findOne(email);

    const shouldSendEmail = await this.computeShouldSendEmail(
      lastEmailVerificationToken?.sentAt,
      options?.requestSendEmail,
    );

    this.logger.info({
      code: "send-email-verification-if-needed",
      lastEmailVerificationTokenSentAt:
        lastEmailVerificationToken?.sentAt?.toISOString(),
      requestSendEmail: options?.requestSendEmail,
      shouldSendEmail,
    });

    if (!shouldSendEmail) {
      return {
        hasSentVerificationEmail: false,
      };
    }

    const token = this.generateToken();

    await this.sendVerificationMail(email, token);

    await this.emailVerificationTokenRepository.upsert({
      email,
      token,
    });

    return {
      hasSentVerificationEmail: true,
    };
  }

  async sendVerificationMail(email: string, token: string) {
    this.logger.info({
      code: "send-verification-mail",
    });

    const validityDuration = this.getValidityDuration();

    try {
      await this.mailer.sendMail({
        to: email,
        subject: "Vérification de votre adresse email",
        htmlContent: OtpEmail({
          token,
          validityDuration,
        }).toString(),
      });
    } catch (error) {
      throw new SendEmailFailureException(error);
    }

    return;
  }

  getValidityDuration(): string {
    const { tokenExpirationDurationInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    const minutes = Math.floor(tokenExpirationDurationInMs / 1000 / 60);
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    const hoursString = `${hours} heure${hours > 1 ? "s" : ""}`;
    if (remainingMinutes === 0) {
      return hoursString;
    }
    return `${hoursString} ${remainingMinutes}`;
  }

  async renderVerificationEmailTemplate(
    res: Response,
    options: {
      errorMessage?: string;
      email: string;
      hasSentVerificationEmail: boolean;
    },
  ) {
    const csrfToken = this.csrfService.getOrCreate();

    const lastEmailVerificationToken =
      await this.emailVerificationTokenRepository.findOne(options.email);

    const countdownEndDate = this.computeCountdownEndDate(
      lastEmailVerificationToken?.sentAt,
    );

    return res.render("verify-email", {
      csrfToken,
      email: options.email,
      hasSentVerificationEmail: options.hasSentVerificationEmail,
      countdownEndDate: countdownEndDate.toISOString(),
      errorMessage: options.errorMessage,
    });
  }

  private async computeShouldSendEmail(
    lastEmailVerificationTokenSentAt: Date | undefined,
    requestSendEmail?: boolean,
  ): Promise<boolean> {
    if (!lastEmailVerificationTokenSentAt) {
      return true;
    }
    const now = new Date();
    const {
      tokenExpirationDurationInMs,
      verificationEmailCooldownBeforeResendInMs,
    } = this.config.get<EmailVerificationConfig>("EmailVerification");

    const isTokenExpired =
      now.getTime() - lastEmailVerificationTokenSentAt.getTime() >
      tokenExpirationDurationInMs;
    if (isTokenExpired) {
      return true;
    }

    if (!requestSendEmail) {
      return false;
    }

    const hasResendCooldownExpired =
      now.getTime() - lastEmailVerificationTokenSentAt.getTime() >
      verificationEmailCooldownBeforeResendInMs;

    return hasResendCooldownExpired;
  }

  async verifyEmailToken(email: string, token: string) {
    try {
      await this.rateLimiter.consume(
        RateLimiterKeyPrefix.VERIFY_EMAIL_TOKEN,
        email,
      );
    } catch (error) {
      throw new TooManyAttemptsException(error);
    }
    const { tokenExpirationDurationInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    const now = new Date();

    const emailVerificationToken =
      await this.emailVerificationTokenRepository.findOne(email);

    if (
      !emailVerificationToken ||
      emailVerificationToken.token !== token ||
      now.getTime() - emailVerificationToken.sentAt.getTime() >
        tokenExpirationDurationInMs
    ) {
      throw new InvalidEmailVerificationTokenException();
    }
  }

  async deleteEmailVerificationToken(email: string) {
    return this.emailVerificationTokenRepository.deleteOne(email);
  }

  private generateToken(): string {
    return customAlphabet("0123456789", 8)();
  }
}
