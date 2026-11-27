import { AppConfig } from "#libs/app";
import { ConfigService } from "#libs/config";
import {
  CrossDeviceAuthenticationService,
  RequestStatus,
  XdaInvalidSession,
  XdaNotEnabled,
  XdaRequestNotFound,
  XdaReviewerSessionInvalid,
} from "#libs/cross-device-authentication";
import { CsrfService, CsrfTokenGuard } from "#libs/csrf";
import { ServiceProviderAdapterMongoService } from "#libs/service-provider-adapter-mongo";
import { type ISessionService, SessionService } from "#libs/session";
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
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import type { Request, Response } from "express";
import { isEmpty } from "lodash";
import { UserSessionDecorator } from "../decorators";
import {
  ActiveUserSessionDto,
  AfterGetInteractionSessionDto,
  CoreFcaSession,
} from "../dto";
import { AfterRedirectToRieWarningSessionDto } from "../dto/user-session/after-redirect-to-rie-warning-session.dto";
import { PollingRoutes, Routes } from "../enums";

@Controller()
export class CrossDeviceAuthenticationController {
  constructor(
    private readonly crossDeviceAuthenticationService: CrossDeviceAuthenticationService,
    private readonly serviceProvider: ServiceProviderAdapterMongoService,
    private readonly csrfService: CsrfService,
    private readonly config: ConfigService,
    private readonly sessionService: SessionService,
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
    // Broader than for the routes that change the request, so that the page
    // still shows the request once consumed
    @UserSessionDecorator(AfterGetInteractionSessionDto)
    userSession: ISessionService<AfterGetInteractionSessionDto>,
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
    // Broader than for the routes that change the request, so that the page
    // still shows the request once consumed
    @UserSessionDecorator(AfterGetInteractionSessionDto)
    userSession: ISessionService<AfterGetInteractionSessionDto>,
  ): Promise<{ status: RequestStatus }> {
    const { status } = await this.getRequestForRequester(
      requestId,
      userSession,
    );
    return { status };
  }

  @Post(Routes.CONTINUE_CROSS_DEVICE_AUTHENTICATION)
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  async continueCrossDeviceAuthentication(
    @Res() res: Response,
    @Param("requestId") requestId: string,
    @UserSessionDecorator(AfterRedirectToRieWarningSessionDto)
    userSession: ISessionService<AfterRedirectToRieWarningSessionDto>,
  ): Promise<void> {
    const { browsingSessionId, idpLoginHint, idpId, interactionId } =
      userSession.get();
    // A request is consumed once, even if the reviewer session turns out to
    // be invalid
    const consumedRequest = await this.crossDeviceAuthenticationService.consume(
      {
        requestId,
        browsingSessionId,
      },
    );
    if (!consumedRequest) {
      throw new XdaRequestNotFound();
    }

    const reviewerSession = await this.getReviewerSession(
      consumedRequest.reviewerSessionId,
    );
    const isSameEmail =
      reviewerSession.idpIdentity.email.toLowerCase() ===
      idpLoginHint.toLowerCase();
    const isSameIdp = reviewerSession.idpId === idpId;
    if (!isSameEmail || !isSameIdp) {
      throw new XdaReviewerSessionInvalid();
    }

    // The session is duplicated here to mitigate cookie-theft-based attacks,
    // as when the IdP calls back
    await userSession.duplicate();
    userSession.set({
      idpId: reviewerSession.idpId,
      idpName: reviewerSession.idpName,
      idpLabel: reviewerSession.idpLabel,
      idpAcr: reviewerSession.idpAcr,
      idpAmr: reviewerSession.idpAmr,
      idpIdentity: reviewerSession.idpIdentity,
      spIdentity: reviewerSession.spIdentity,
      isEmailVerifiedByPcf: reviewerSession.isEmailVerifiedByPcf,
      // The requester is authenticated by the IdP authentication of the reviewer
      authTime: reviewerSession.authTime,
      isCrossDeviceAuthenticated: true,
      idpNonce: null,
      idpState: null,
      idpAuthorizationUrl: null,
    });

    const { urlPrefix } = this.config.get<AppConfig>("App");
    res.redirect(
      `${urlPrefix}${Routes.INTERACTION_VERIFY.replace(":uid", interactionId)}`,
    );
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
    const { idpIdentity } = this.getReviewer(userSession);
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
    const { idpIdentity } = this.getReviewer(userSession);
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
    const { idpIdentity } = this.getReviewer(userSession);
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
    const reviewedStatuses = [
      RequestStatus.APPROVED,
      RequestStatus.CONSUMED,
      RequestStatus.REJECTED,
    ];
    if (!reviewedStatuses.includes(status)) {
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
    userSession: ISessionService<AfterGetInteractionSessionDto>,
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

  // A session obtained through a cross-device authentication cannot review
  // another request
  private getReviewer(
    userSession: ISessionService<ActiveUserSessionDto>,
  ): ActiveUserSessionDto {
    const reviewer = userSession.get();
    if (reviewer.isCrossDeviceAuthenticated) {
      throw new XdaInvalidSession();
    }
    return reviewer;
  }

  private async getRequestForReviewer(
    requestId: string,
    userSession: ISessionService<ActiveUserSessionDto>,
  ) {
    const { idpIdentity } = this.getReviewer(userSession);
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

  private async getReviewerSession(
    reviewerSessionId: string | null,
  ): Promise<ActiveUserSessionDto> {
    if (!reviewerSessionId) {
      throw new XdaReviewerSessionInvalid();
    }

    let reviewerSession: CoreFcaSession;
    try {
      reviewerSession =
        await this.sessionService.getDataFromBackend<CoreFcaSession>(
          reviewerSessionId,
        );
    } catch {
      // The reviewer has logged out, or their session has expired
      throw new XdaReviewerSessionInvalid();
    }

    const reviewerUserSession = plainToInstance(
      ActiveUserSessionDto,
      reviewerSession.User,
    );
    const validationErrors = await validate(reviewerUserSession);
    // A session obtained through a cross-device authentication cannot be
    // shared again
    if (
      !isEmpty(validationErrors) ||
      reviewerUserSession.isCrossDeviceAuthenticated
    ) {
      throw new XdaReviewerSessionInvalid();
    }
    return reviewerUserSession;
  }

  private async reviewRequest(
    res: Response,
    requestId: string,
    userSession: ISessionService<ActiveUserSessionDto>,
    status: RequestStatus.APPROVED | RequestStatus.REJECTED,
  ): Promise<void> {
    const { idpIdentity } = this.getReviewer(userSession);
    const isReviewed = await this.crossDeviceAuthenticationService.review({
      requestId,
      email: idpIdentity.email,
      status,
      reviewerSessionId: this.sessionService.getId(),
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
