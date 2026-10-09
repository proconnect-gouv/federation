import { CrossDeviceAuthenticationService } from "@fc/cross-device-authentication";
import { type ISessionService } from "@fc/session";
import { Controller, Get, Header, Post, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { UserSessionDecorator } from "../decorators";
import { ActiveUserSessionDto } from "../dto/user-session/active-user-session.dto";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { Routes } from "../enums";

@Controller()
export class CrossDeviceAuthenticationController {
  constructor(
    private readonly crossDeviceAuthenticationService: CrossDeviceAuthenticationService,
  ) {}
  @Post(Routes.PROCEED_TO_CROSS_DEVICE_AUTHENTICATION)
  @Header("cache-control", "no-store")
  async proceedToCrossDeviceAuthentication(
    @Res() res: Response,
    @Req() req: Request,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { spName, idpLoginHint } = userSession.get();
    const {
      id: requestId,
      emojis,
      deviceSecret,
    } = await this.crossDeviceAuthenticationService.create({
      userAgent: req.headers["user-agent"] || "",
      spName,
      email: idpLoginHint,
    });
    res.render("proceed-to-cross-device-authentication", {
      requestId,
      emojis,
      deviceSecret,
    });
  }

  @Get(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUESTS)
  @Header("cache-control", "no-store")
  async reviewCrossDeviceAuthenticationRequests(
    @Res() res: Response,
    @UserSessionDecorator(ActiveUserSessionDto)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const { idpIdentity } = userSession.get();
    const pendingRequests =
      await this.crossDeviceAuthenticationService.getInitiatedRequests(
        idpIdentity.email,
      );
    res.render("review-cross-device-authentication-requests", {
      pendingRequests,
    });
  }
}
