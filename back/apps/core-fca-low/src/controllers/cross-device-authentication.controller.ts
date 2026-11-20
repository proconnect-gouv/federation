import { AppConfig } from "#libs/app";
import { ConfigService } from "#libs/config";
import {
  CrossDeviceAuthenticationService,
  RequestStatus,
  XdaInvalidSession,
  XdaNotEnabled,
  XdaRequestNotFound,
} from "#libs/cross-device-authentication";
import { CsrfService, CsrfTokenGuard } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { type ISessionService } from "#libs/session";
import {
  Controller,
  Get,
  Header,
  HttpCode,
  HttpStatus,
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
import { PollingRoutes, Routes } from "../enums";

@Controller()
export class CrossDeviceAuthenticationController {
  constructor(
    private readonly crossDeviceAuthenticationService: CrossDeviceAuthenticationService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly csrfService: CsrfService,
    private readonly config: ConfigService,
  ) {}
  @Post(Routes.CREATE_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async initiateCrossDeviceAuthentication(
    @Res() res: Response,
    @Req() req: Request,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { spId, spName, idpLoginHint, browsingSessionId } = userSession.get();
    await this.ensureXdaIsEnabled(spId, spName);

    const { _id: requestId } =
      await this.crossDeviceAuthenticationService.findOrCreateRequest({
        userAgent: req.headers["user-agent"] || "",
        spName,
        email: idpLoginHint,
        browsingSessionId,
      });

    res.redirect(
      this.getRequestUrl(
        Routes.CROSS_DEVICE_AUTHENTICATION_FLOW,
        requestId.toString(),
      ),
    );
  }

  @Get(Routes.CROSS_DEVICE_AUTHENTICATION_FLOW)
  @Header("cache-control", "no-store")
  async getCrossDeviceAuthenticationFlow(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { status, emojis } = await this.getRequestForRequester(
      requestId,
      userSession,
    );

    const csrfToken = this.csrfService.getOrCreate();
    res.render("cross-device-authentication-flow", {
      csrfToken,
      requestId,
      status,
      emojis,
    });
  }

  @Get(PollingRoutes.CROSS_DEVICE_AUTHENTICATION_STATUS)
  @Header("cache-control", "no-store")
  async getCrossDeviceAuthenticationRequestStatusForRequester(
    @Param("requestId") requestId: string,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<{ status: RequestStatus }> {
    const { status } = await this.getRequestForRequester(
      requestId,
      userSession,
    );
    return { status };
  }

  @Post(Routes.CROSS_DEVICE_AUTHENTICATION_EMOJIS_DISPLAYED)
  @Header("cache-control", "no-store")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(CsrfTokenGuard)
  async markCrossDeviceAuthenticationEmojisAsDisplayed(
    @Param("requestId") requestId: string,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { browsingSessionId } = userSession.get();
    await this.crossDeviceAuthenticationService.markAsEmojisDisplayed({
      requestId,
      browsingSessionId,
    });
  }

  @Get(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUESTS)
  @Header("cache-control", "no-store")
  async reviewCrossDeviceAuthenticationRequests(
    @Res() res: Response,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const csrfToken = this.csrfService.getOrCreate();
    const { idpIdentity } = userSession.get();
    const notReviewedRequests =
      await this.crossDeviceAuthenticationService.getNotReviewedRequests(
        idpIdentity.email,
      );

    res.render("review-cross-device-authentication-request-list", {
      csrfToken,
      notReviewedRequests,
    });
  }

  @Get(PollingRoutes.CROSS_DEVICE_AUTHENTICATION_NOT_REVIEWED_REQUESTS)
  @Header("cache-control", "no-store")
  async getCrossDeviceAuthenticationNotReviewedRequests(
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<{ notReviewedRequestIds: string[] }> {
    const { idpIdentity } = userSession.get();
    const notReviewedRequests =
      await this.crossDeviceAuthenticationService.getNotReviewedRequests(
        idpIdentity.email,
      );
    return { notReviewedRequestIds: notReviewedRequests.map(({ id }) => id) };
  }

  @Post(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async reviewCrossDeviceAuthenticationRequest(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const csrfToken = this.csrfService.getOrCreate();
    const { idpIdentity } = userSession.get();
    const result =
      await this.crossDeviceAuthenticationService.markAsVerificationStarted({
        requestId,
        email: idpIdentity.email,
      });
    if (!result) {
      throw new XdaRequestNotFound();
    }

    res.render("review-cross-device-authentication-request", {
      csrfToken,
      requestId,
      status: result.status,
      emojis: result.emojis,
    });
  }

  @Get(Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  async getReviewedCrossDeviceAuthenticationRequest(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    const { status } = await this.getRequestForReviewer(requestId, userSession);
    if (![RequestStatus.APPROVED, RequestStatus.REJECTED].includes(status)) {
      throw new XdaRequestNotFound();
    }

    res.render("review-cross-device-authentication-request", { status });
  }

  @Get(PollingRoutes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST_STATUS)
  @Header("cache-control", "no-store")
  async getCrossDeviceAuthenticationRequestStatusForReviewer(
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<{ status: RequestStatus }> {
    const { status } = await this.getRequestForReviewer(requestId, userSession);
    return { status };
  }

  @Post(Routes.APPROVE_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async approveCrossDeviceAuthenticationRequest(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    return this.reviewRequest(
      res,
      requestId,
      userSession,
      RequestStatus.APPROVED,
    );
  }

  @Post(Routes.REJECT_CROSS_DEVICE_AUTHENTICATION_REQUEST)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async rejectCrossDeviceAuthenticationRequest(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(ActiveUserSessionDto, XdaInvalidSession)
    userSession: ISessionService<ActiveUserSessionDto>,
  ): Promise<void> {
    return this.reviewRequest(
      res,
      requestId,
      userSession,
      RequestStatus.REJECTED,
    );
  }

  private getRequestUrl(route: Routes, requestId: string): string {
    const { urlPrefix } = this.config.get<AppConfig>("App");
    return `${urlPrefix}${route.replace(":requestId", requestId)}`;
  }

  private async ensureXdaIsEnabled(spId: string, spName: string) {
    const { isXdaEnabled } = await this.serviceProvider.getById(spId);
    if (!isXdaEnabled) {
      throw new XdaNotEnabled(spName);
    }
  }

  private async getRequestForRequester(
    requestId: string,
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ) {
    const { browsingSessionId } = userSession.get();
    const result =
      await this.crossDeviceAuthenticationService.getRequestForRequester({
        requestId,
        browsingSessionId,
      });
    if (!result) {
      throw new XdaRequestNotFound();
    }
    return result;
  }

  private async getRequestForReviewer(
    requestId: string,
    userSession: ISessionService<ActiveUserSessionDto>,
  ) {
    const { idpIdentity } = userSession.get();
    const result =
      await this.crossDeviceAuthenticationService.getRequestForReviewer({
        requestId,
        email: idpIdentity.email,
      });
    if (!result) {
      throw new XdaRequestNotFound();
    }
    return result;
  }

  private async reviewRequest(
    res: Response,
    requestId: string,
    userSession: ISessionService<ActiveUserSessionDto>,
    status: RequestStatus.APPROVED | RequestStatus.REJECTED,
  ): Promise<void> {
    const { idpIdentity } = userSession.get();
    const isReviewed = await this.crossDeviceAuthenticationService.review({
      requestId,
      email: idpIdentity.email,
      status,
    });
    if (!isReviewed) {
      throw new XdaRequestNotFound();
    }

    res.redirect(
      this.getRequestUrl(
        Routes.REVIEW_CROSS_DEVICE_AUTHENTICATION_REQUEST,
        requestId,
      ),
    );
  }
}
