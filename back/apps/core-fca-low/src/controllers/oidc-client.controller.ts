import { Request, Response } from 'express';

import {
  Body,
  Controller,
  Get,
  Header,
  Post,
  Render,
  Req,
  Res,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { AccountFcaService } from '@fc/account-fca';
import { ConfigService } from '@fc/config';
import { UserSessionDecorator } from '@fc/core/decorators';
import { PostIdentityProviderSelectionDto } from '@fc/core/dto/post-identity-provider-selection.dto';
import { CryptographyService } from '@fc/cryptography';
import { CsrfService, CsrfTokenGuard } from '@fc/csrf';
import { LoggerService, TrackedEvent } from '@fc/logger';
import { OidcClientConfigService, OidcClientService } from '@fc/oidc-client';
import { ISessionService, SessionService } from '@fc/session';

import {
  AfterGetInteractionSessionDto,
  AfterRedirectToIdpWithEmailSessionDto,
  AfterRedirectToIdpWithIdpIdSessionDto,
  AppConfig,
  RedirectToIdp,
  UserSession,
} from '../dto';
import { Routes } from '../enums';
import {
  CoreFcaControllerService,
  CoreFcaService,
  IdentitySanitizer,
} from '../services';

@Controller()
export class OidcClientController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly accountService: AccountFcaService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcClientConfig: OidcClientConfigService,
    private readonly coreFcaService: CoreFcaService,
    private readonly coreFcaControllerService: CoreFcaControllerService,
    private readonly sessionService: SessionService,
    private readonly crypto: CryptographyService,
    private readonly sanitizer: IdentitySanitizer,
    private readonly csrfService: CsrfService,
  ) {}

  @Get(Routes.IDENTITY_PROVIDER_SELECTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
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

    const csrfToken = this.csrfService.renew();
    this.sessionService.set('Csrf', { csrfToken });

    return res.render('interaction-identity-provider', {
      csrfToken,
      identityProviders: displayableIdps,
      hasDefaultIdp: this.coreFcaService.hasDefaultIdp(
        identityProviders.map(({ uid }) => uid),
      ),
    });
  }

  @Post(Routes.IDENTITY_PROVIDER_SELECTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
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
  @Header('cache-control', 'no-store')
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

  @Post(Routes.DISCONNECT_FROM_IDP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
  async logoutFromIdp(
    @Res() res: Response,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ) {
    const { idpIdToken, idpId } = userSession.get();

    const { stateLength } = await this.oidcClientConfig.get();
    const idpState: string = this.crypto.genRandomString(stateLength);

    const endSessionUrl: string = await this.oidcClient.getEndSessionUrl(
      idpId,
      idpState,
      idpIdToken,
    );

    this.logger.track(TrackedEvent.FC_REQUESTED_LOGOUT_FROM_IDP);

    return res.redirect(endSessionUrl);
  }

  @Get(Routes.CLIENT_LOGOUT_CALLBACK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
  @Render('oidc-provider-logout-form')
  async redirectAfterIdpLogout(
    @Req() req: Request,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ) {
    const { oidcProviderLogoutForm } = userSession.get();

    this.logger.track(TrackedEvent.FC_SESSION_TERMINATED);

    await userSession.destroy();

    return { oidcProviderLogoutForm };
  }

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */

  @Get(Routes.OIDC_CALLBACK)
  @Header('cache-control', 'no-store')
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
    const tokenParams = {
      state: idpState,
      nonce: idpNonce,
    };

    const extraParams = {
      sp_id: spId,
      sp_name: spName,
    };

    const { accessToken, idToken, acr, amr } = await this.oidcClient.getToken(
      idpId,
      tokenParams,
      req,
      extraParams,
    );

    userSession.set({
      amr,
      idpIdToken: idToken,
      idpAcr: acr,
    });

    this.logger.track(TrackedEvent.FC_REQUESTED_IDP_TOKEN);

    const userInfoParams = {
      accessToken,
      idpId,
    };

    const plainIdpIdentity = await this.oidcClient.getUserinfo(userInfoParams);

    const idpIdentity = await this.sanitizer.getValidatedIdentityFromIdp(
      plainIdpIdentity,
      idpId,
    );

    userSession.set({
      idpIdentity,
    });

    const isAllowedIdpForEmail = await this.coreFcaService.isAllowedIdpForEmail(
      idpId,
      idpIdentity.email,
    );

    if (!isAllowedIdpForEmail) {
      this.logger.warn({ code: 'fqdn_mismatch' });
    }

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
      acr,
    );

    userSession.set({
      spIdentity,
    });

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    res.redirect(url);
  }
}
