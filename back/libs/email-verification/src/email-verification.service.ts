import { ConfigService } from "@fc/config";
import { CsrfService } from "@fc/csrf";
import { LoggerService } from "@fc/logger";
import { MailerService } from "@fc/mailer";
import { RateLimiterService } from "@fc/rate-limiter";
import { RateLimiterKeyPrefix } from "@fc/rate-limiter/enum";
import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { VerifyEmail } from "@proconnect-gouv/proconnect.email";
import { Response } from "express";
import { Model } from "mongoose";
import { customAlphabet } from "nanoid";
import { EmailVerificationConfig } from "./dto";
import {
  InvalidEmailVerificationTokenException,
  SendEmailFailureException,
  TooManyAttemptsException,
} from "./exceptions";
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
    private readonly csrfService: CsrfService,
  ) {}

  computeIsEmailEligible(email: string): boolean {
    const { eligibleEmailsPercentage } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    return email.length % 10 < (eligibleEmailsPercentage / 100) * 10;
  }

  computeCountdownEndDate(
    lastEmailVerificationTokenSentAt: Date | undefined,
  ): Date {
    const { verificationEmailWaitingDurationBeforeResendInMs } =
      this.config.get<EmailVerificationConfig>("EmailVerification");
    if (!lastEmailVerificationTokenSentAt) {
      const now = new Date();
      return new Date(
        now.getTime() + verificationEmailWaitingDurationBeforeResendInMs,
      );
    }
    return new Date(
      lastEmailVerificationTokenSentAt.getTime() +
        verificationEmailWaitingDurationBeforeResendInMs,
    );
  }

  async findLastEmailVerificationToken(email: string) {
    return this.model.findOne({ email }).sort({ sentAt: -1 });
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
      };
    }

    const token = this.generateToken();

    await this.sendVerificationMail(email, token);

    await this.model.findOneAndUpdate(
      {
        email,
      },
      {
        email,
        token,
        sentAt: new Date(),
      },
      { upsert: true },
    );

    return {
      hasSentVerificationEmail: true,
    };
  }

  async sendVerificationMail(email: string, token: string) {
    this.logger.info({
      code: "send-verification-mail",
      email,
    });

    try {
      await this.mailer.sendMail({
        to: email,
        subject: "Vérification de votre adresse email",
        htmlContent: VerifyEmail({
          token,
        }).toString(),
      });
    } catch (error) {
      throw new SendEmailFailureException(error);
    }

    return;
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
      await this.findLastEmailVerificationToken(options.email);

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
    lastEmailVerificationTokenSentAt?: Date,
  ): Promise<boolean> {
    if (!lastEmailVerificationTokenSentAt) {
      return true;
    }
    const now = new Date();
    const {
      tokenExpirationDurationInMs,
      verificationEmailWaitingDurationBeforeResendInMs,
    } = this.config.get<EmailVerificationConfig>("EmailVerification");

    const isTokenExpired =
      now.getTime() - lastEmailVerificationTokenSentAt.getTime() >
      tokenExpirationDurationInMs;
    if (isTokenExpired) {
      return true;
    }

    const hasResendCooldownExpired =
      now.getTime() - lastEmailVerificationTokenSentAt.getTime() >
      verificationEmailWaitingDurationBeforeResendInMs;
    if (hasResendCooldownExpired) {
      return true;
    }

    return false;
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

    const emailVerificationToken = await this.model.findOne({
      email,
    });

    if (
      !emailVerificationToken ||
      emailVerificationToken.token !== token ||
      now.getTime() - emailVerificationToken.sentAt.getTime() >
        tokenExpirationDurationInMs
    ) {
      throw new InvalidEmailVerificationTokenException();
    }
  }

  async deleteEmailToken(email: string) {
    return this.model.deleteOne({ email });
  }

  private generateToken(): string {
    return customAlphabet("0123456789", 10)();
  }
}
