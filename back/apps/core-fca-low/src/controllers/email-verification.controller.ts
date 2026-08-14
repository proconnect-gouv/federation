import { AppConfig } from "@fc/app";
import { ConfigService } from "@fc/config";
import { CsrfTokenGuard } from "@fc/csrf";
import {
  EmailVerificationExceptionFilter,
  EmailVerificationService,
} from "@fc/email-verification";
import { type ISessionService } from "@fc/session";
import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Req,
  Res,
  UseFilters,
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
  ) {}

  @Get(Routes.VERIFY_EMAIL)
  @Header("cache-control", "no-store")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseFilters(EmailVerificationExceptionFilter)
  async getVerifyEmail(
    @Req() _req: Request,
    @Res() res: Response,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSession: ISessionService<AfterGetOidcCallbackSessionDto>,
  ): Promise<void> {
    const {
      spIdentity: { email },
    } = userSession.get();

    const { hasSentVerificationEmail } =
      await this.emailVerification.sendEmailVerificationIfNeeded(email);

    return this.emailVerification.renderVerificationEmailTemplate(res, {
      email,
      hasSentVerificationEmail,
    });
  }

  @Post(Routes.VERIFY_EMAIL)
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  @UseFilters(EmailVerificationExceptionFilter)
  async postVerifyEmail(
    @Res() res: Response,
    @Body() body: VerifyEmailDto,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSession: ISessionService<AfterGetOidcCallbackSessionDto>,
  ): Promise<void> {
    const { verify_email_token } = body;
    const {
      spAmr,
      spIdentity: { email },
      interactionId,
    } = userSession.get();
    const { urlPrefix } = this.config.get<AppConfig>("App");

    await this.emailVerification.verifyEmailToken(email, verify_email_token);

    const newSpAmr = spAmr ? [...spAmr, "mail"] : ["mail"];
    userSession.set({ isEmailVerifiedByPcf: true, spAmr: newSpAmr });
    await userSession.commit();

    await this.emailVerification.deleteEmailVerificationToken(email);

    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    return res.redirect(url);
  }

  @Post(Routes.VERIFY_EMAIL_RESEND)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  @UseFilters(EmailVerificationExceptionFilter)
  async postResendVerifyEmail(
    @Res() res: Response,
    @UserSessionDecorator(AfterGetOidcCallbackSessionDto)
    userSession: ISessionService<AfterGetOidcCallbackSessionDto>,
  ): Promise<void> {
    const {
      spIdentity: { email },
    } = userSession.get();

    const { hasSentVerificationEmail } =
      await this.emailVerification.sendEmailVerificationIfNeeded(email, {
        requestSendEmail: true,
      });

    return this.emailVerification.renderVerificationEmailTemplate(res, {
      email,
      hasSentVerificationEmail,
    });
  }
}
