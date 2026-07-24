import { AppConfig } from "@fc/app";
import { ConfigService } from "@fc/config";
import { CsrfService, CsrfTokenGuard } from "@fc/csrf";
import { EmailVerificationService } from "@fc/email-verification";
import { LoggerService } from "@fc/logger";
import { MailerConfig } from "@fc/mailer/dto";
import { type ISessionService } from "@fc/session";
import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { type Request, type Response } from "express";
import { UserSessionDecorator } from "../decorators";
import { AfterGetOidcCallbackSessionDto, VerifyEmailDto } from "../dto";
import { Routes } from "../enums";

@Controller()
export class EmailVerificationController {
  constructor(
    private readonly emailVerification: EmailVerificationService,
    private readonly config: ConfigService,
    private readonly csrfService: CsrfService,
    private readonly logger: LoggerService,
  ) {}

  @Get(Routes.VERIFY_EMAIL)
  @Header("cache-control", "no-store")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerifyEmail(
    @Req() req: Request,
    @Res() res: Response,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSession: ISessionService<AfterGetOidcCallbackSessionDto>,
  ): Promise<void> {
    const {
      spIdentity: { email },
    } = userSession.get();
    const { error } = req.query;
    const { fromEmail } = this.config.get<MailerConfig>("Mailer");
    const csrfToken = this.csrfService.getOrCreate();

    let emailVerificationResult;
    try {
      emailVerificationResult =
        await this.emailVerification.sendEmailVerificationIfNeeded(email);
    } catch (err: any) {
      this.logger.error({
        code: "email-verification-service-send-email-error",
        emailVerificationSendError: err,
        emailVerificationSendErrorCause: err?.cause,
        emailVerificationSendErrorType: err?.constructor?.name,
      });

      return res.render("verify-email", {
        csrfToken,
        hasSentVerificationEmail: false,
        errorMessage: "Une erreur est survenue. Veuillez réessayer plus tard.",
      });
    }

    const countdownEndDate = this.emailVerification.computeCountdownEndDate(
      emailVerificationResult?.lastTokenSentAt,
    );

    const errorMessage = this.emailVerification.computeTokenErrorMessage(
      error as string,
    );

    return res.render("verify-email", {
      csrfToken,
      fromEmail,
      hasSentVerificationEmail:
        emailVerificationResult?.hasSentVerificationEmail,
      countdownEndDate: countdownEndDate.toISOString(),
      errorMessage,
    });
  }

  @Post(Routes.VERIFY_EMAIL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async postVerifyEmail(
    @Res() res: Response,
    @Body() body: VerifyEmailDto,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSession: ISessionService<AfterGetOidcCallbackSessionDto>,
  ): Promise<void> {
    const { verify_email_token } = body;
    const {
      spIdentity: { email },
      interactionId,
    } = userSession.get();
    const { urlPrefix } = this.config.get<AppConfig>("App");

    const emailVerificationResult =
      await this.emailVerification.verifyEmailToken(email, verify_email_token);
    if (!emailVerificationResult.isTokenValid) {
      const errorMessage = emailVerificationResult.error;
      return res.redirect(
        `${urlPrefix}${Routes.VERIFY_EMAIL}?error=${errorMessage}`,
      );
    }

    userSession.set({ isEmailVerifiedByPcf: true });
    await userSession.commit();
    await this.emailVerification.deleteEmailTokens(email);

    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    return res.redirect(url);
  }
}
