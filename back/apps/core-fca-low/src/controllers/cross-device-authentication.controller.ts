import { CrossDeviceAuthenticationService } from "#libs/cross-device-authentication";
import { CsrfService, CsrfTokenGuard } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { type ISessionService } from "#libs/session";
import {
  Controller,
  Get,
  Header,
  Param,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { UserSessionDecorator } from "../decorators";
import { ActiveUserSessionDto } from "../dto/user-session/active-user-session.dto";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { Routes } from "../enums";
import { XdaNotEnabled, XdaRequestNotFound } from "../exceptions";

@Controller()
export class CrossDeviceAuthenticationController {
  constructor(
    private readonly crossDeviceAuthenticationService: CrossDeviceAuthenticationService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly csrfService: CsrfService,
  ) {}
  @Post(Routes.PROCEED_TO_CROSS_DEVICE_AUTHENTICATION)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async proceedToCrossDeviceAuthentication(
    @Res() res: Response,
    @Req() req: Request,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { spId, spName, idpLoginHint, browsingSessionId } = userSession.get();
    const { isXdaEnabled } = await this.serviceProvider.getById(spId);
    if (!isXdaEnabled) {
      throw new XdaNotEnabled(spName);
    }

    const { _id: requestId, emojis } =
      await this.crossDeviceAuthenticationService.create({
        userAgent: req.headers["user-agent"] || "",
        spName,
        email: idpLoginHint,
        browsingSessionId,
      });
    res.render("proceed-to-cross-device-authentication", {
      requestId,
      emojis,
    });
  }

  @Get(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUESTS)
  @Header("cache-control", "no-store")
  async reviewCrossDeviceAuthenticationRequests(
    @Res() res: Response,
    @UserSessionDecorator(ActiveUserSessionDto)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const csrfToken = this.csrfService.getOrCreate();
    const { idpIdentity } = userSession.get();
    const awaitingRequests =
      await this.crossDeviceAuthenticationService.getAwaitingRequests(
        idpIdentity.email,
      );

    res.render("review-cross-device-authentication-requests", {
      csrfToken,
      awaitingRequests,
    });
  }

  @Post(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async reviewCrossDeviceAuthenticationRequest(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const { idpIdentity } = userSession.get();
    const result = await this.crossDeviceAuthenticationService.markAsPending({
      requestId,
      email: idpIdentity.email,
    });
    if (!result) {
      throw new XdaRequestNotFound();
    }

    res.render("review-cross-device-authentication-request", {
      emojis: result.emojis,
      device: result.device,
      spName: result.spName,
    });
  }
}
