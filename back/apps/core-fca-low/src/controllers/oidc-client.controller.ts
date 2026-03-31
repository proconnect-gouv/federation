import { AccountFcaService } from "@fc/account-fca";
import { ConfigService } from "@fc/config";
import { CsrfService, CsrfTokenGuard } from "@fc/csrf";
import { LoggerService, TrackedEvent } from "@fc/logger";
import { OidcClientService } from "@fc/oidc-client";
import { OidcProviderRoutes } from "@fc/oidc-provider";
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
import { isEmpty } from "lodash";
import { UserSessionDecorator } from "../decorators";
import {
  AfterGetInteractionSessionDto,
  AfterRedirectToIdpWithEmailSessionDto,
  AfterRedirectToIdpWithIdpIdSessionDto,
  AppConfig,
  RedirectToIdp,
  UserSession,
} from "../dto";
import { PostIdentityProviderSelectionDto } from "../dto/post-identity-provider-selection.dto";
import { Routes } from "../enums";
import {
  CoreFcaControllerService,
  CoreFcaService,
  IdentitySanitizer,
} from "../services";

@Controller()
export class OidcClientController {
  constructor(
    private readonly accountService: AccountFcaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly coreFcaService: CoreFcaService,
    private readonly coreFcaControllerService: CoreFcaControllerService,
    private readonly sanitizer: IdentitySanitizer,
    private readonly csrfService: CsrfService,
  ) {}

  @Get(Routes.IDENTITY_PROVIDER_SELECTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header("cache-control", "no-store")
  async getIdentityProviderSelection(
    @Res() res: Response,
    @UserSessionDecorator(AfterRedirectToIdpWithEmailSessionDto)
    userSession: ISessionService<AfterRedirectToIdpWithEmailSessionDto>,
  ) {
    const { idpLoginHint: email } = userSession.get();

    const identityProviders =
      await this.coreFcaService.selectIdpsFromEmail(email);
    const displayableIdps =
      this.coreFcaService.getSortedDisplayableIdentityProviders(
        identityProviders,
      );

    const csrfToken = this.csrfService.getOrCreate();

    return res.render("identity-provider-selection", {
      csrfToken,
      identityProviders: displayableIdps,
      hasDefaultIdp: this.coreFcaService.hasDefaultIdp(
        identityProviders.map(({ uid }) => uid),
      ),
    });
  }

  @Post(Routes.IDENTITY_PROVIDER_SELECTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  postIdentityProviderSelection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostIdentityProviderSelectionDto,
  ) {
    const { identityProviderUid: idpId } = body;

    return this.coreFcaControllerService.redirectToIdpWithIdpId(
      req,
      res,
      idpId,
    );
  }

  @Post(Routes.REDIRECT_TO_IDP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header("cache-control", "no-store")
  @UseGuards(CsrfTokenGuard)
  redirectToIdp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RedirectToIdp,
    @UserSessionDecorator(AfterGetInteractionSessionDto)
    _userSession: ISessionService<AfterGetInteractionSessionDto>,
  ): Promise<void> {
    const { email, rememberMe = false } = body;

    return this.coreFcaControllerService.redirectToIdpWithEmail(
      req,
      res,
      email,
      rememberMe,
    );
  }

  @Get(Routes.OIDC_CALLBACK)
  @Header("cache-control", "no-store")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getOidcCallback(
    @Req() req: Request,
    @Res() res: Response,
    @UserSessionDecorator(AfterRedirectToIdpWithIdpIdSessionDto)
    userSession: ISessionService<AfterRedirectToIdpWithIdpIdSessionDto>,
  ) {
    // The session is duplicated here to mitigate cookie-theft-based attacks.
    // For more information, refer to: https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1288
    await userSession.duplicate();

    const { idpId, idpNonce, idpState, interactionId, spId, spName } =
      userSession.get();

    // Remove nonce and state from the session to prevent replay attacks
    userSession.set({ idpNonce: null, idpState: null });

    this.logger.track(TrackedEvent.IDP_CALLEDBACK);

    const { accessToken, idToken, claims } = await this.oidcClient.getToken({
      idpId,
      req,
      idpState,
      idpNonce,
      spId,
      spName,
    });

    userSession.set({
      amr: claims.amr,
      idpIdToken: idToken,
      idpAcr: claims.acr,
    });

    this.logger.track(TrackedEvent.FC_REQUESTED_IDP_TOKEN);

    const plainIdpIdentity = await this.oidcClient.getUserinfo({
      idpId,
      accessToken,
      claims,
    });

    const idpIdentity = await this.sanitizer.getValidatedIdentityFromIdp(
      plainIdpIdentity,
      idpId,
    );

    userSession.set({
      idpIdentity,
    });

    await this.coreFcaService.ensureIdpCanServeThisEmail(
      idpId,
      idpIdentity.email,
    );

    this.logger.track(TrackedEvent.FC_REQUESTED_IDP_USERINFO);

    const account = await this.accountService.getOrCreateAccount(
      idpId,
      idpIdentity.sub,
      idpIdentity.email,
    );

    const spIdentity = await this.sanitizer.transformIdentity(
      idpIdentity,
      idpId,
      account.sub,
      claims.acr,
    );

    userSession.set({
      spIdentity,
    });

    const { urlPrefix } = this.config.get<AppConfig>("App");
    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    res.redirect(url);
  }

  @Get(Routes.OIDC_LOGOUT_CALLBACK)
  getOidcLogoutCallback(
    @Res() res: Response,
    @UserSessionDecorator() userSession: ISessionService<UserSession>,
  ) {
    const { urlPrefix } = this.config.get<AppConfig>("App");
    let url = `${urlPrefix}${OidcProviderRoutes.END_SESSION}?from_idp=true`;

    const searchParams = userSession.get("orginalLogoutUrlSearchParamsFromSp");
    if (!isEmpty(searchParams)) {
      url += `&${searchParams}`;
    }

    res.redirect(url);
  }
}
