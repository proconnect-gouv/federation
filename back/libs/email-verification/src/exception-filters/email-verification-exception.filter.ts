import { ConfigService } from "#libs/config";
import { BaseExceptionFilter } from "#libs/exceptions/filters/index";
import { LoggerService } from "#libs/logger";
import { SessionService } from "#libs/session";
import { Catch, Injectable } from "@nestjs/common";
import { Response } from "express";
import { EmailVerificationService } from "../email-verification.service";
import { EmailVerificationBaseException } from "../exceptions";

@Catch(EmailVerificationBaseException)
@Injectable()
export class EmailVerificationExceptionFilter extends BaseExceptionFilter {
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
    protected readonly emailVerification: EmailVerificationService,
  ) {
    super(config, session, logger);
  }

  protected async errorOutput({
    error,
    exception,
    res,
  }: {
    error: { code: string; id: string; message: string };
    exception: EmailVerificationBaseException;
    res: Response;
  }) {
    const email = this.session.get("User", "spIdentity.email");

    return this.emailVerification.renderVerificationEmailTemplate(res, {
      email,
      errorMessage: exception.userMessage,
      hasSentVerificationEmail: false,
    });
  }
}
