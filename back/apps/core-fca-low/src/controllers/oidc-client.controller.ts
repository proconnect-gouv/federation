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
import { EmailValidatorService } from '@fc/email-validator/services';
import { AuthorizeStepFrom, SetStep } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcClientConfigService, OidcClientService } from '@fc/oidc-client';
import { ISessionService, SessionService } from '@fc/session';
import { Track, TrackingService } from '@fc/tracking';
import { TrackedEvent } from '@fc/tracking/enums';

import {
  AppConfig,
  GetIdentityProviderSelectionSessionDto,
  GetOidcCallbackSessionDto,
  RedirectToIdp,
  UserSession,
} from '../dto';
import { Routes } from '../enums';
import {
  CoreFcaAgentNoIdpException,
  CoreFcaIdpConfigurationException,
} from '../exceptions';
import {
  CoreFcaFqdnService,
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
    private readonly coreFca: CoreFcaService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly sessionService: SessionService,
    private readonly tracking: TrackingService,
    private readonly crypto: CryptographyService,
    private readonly emailValidatorService: EmailValidatorService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly sanitizer: IdentitySanitizer,
    private readonly csrfService: CsrfService,
  ) {}

  @Get(Routes.IDENTITY_PROVIDER_SELECTION)
  @Header('cache-control', 'no-store')
  @AuthorizeStepFrom([
    Routes.REDIRECT_TO_IDP, // Standard flow
    Routes.IDENTITY_PROVIDER_SELECTION, // Navigation back
  ])
  @SetStep()
  async getIdentityProviderSelection(
    @Res() res: Response,
    @UserSessionDecorator(GetIdentityProviderSelectionSessionDto)
    userSession: ISessionService<UserSession>,
  ) {
    const { login_hint: email } = userSession.get();
    const fqdnConfig = await this.fqdnService.getFqdnConfigFromEmail(email);
    const { identityProviderIds } = fqdnConfig;

    const providers =
      await this.coreFca.getIdentityProvidersByIds(identityProviderIds);

    const csrfToken = this.csrfService.renew();
    this.sessionService.set('Csrf', { csrfToken });

    const response = {
      csrfToken,
      email,
      providers,
      hasDefaultIdp: this.coreFca.hasDefaultIdp(
        providers.map(({ uid }) => uid),
      ),
    };

    res.render('interaction-identity-provider', response);
  }

  @Post(Routes.IDENTITY_PROVIDER_SELECTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
  @AuthorizeStepFrom([
    Routes.IDENTITY_PROVIDER_SELECTION, // Multi-idp flow
  ])
  @UseGuards(CsrfTokenGuard)
  postIdentityProviderSelection(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: PostIdentityProviderSelectionDto,
  ) {
    const { identityProviderUid: idpId } = body;

    return this.coreFca.redirectToIdp(req, res, idpId);
  }

  @Post(Routes.REDIRECT_TO_IDP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
  @AuthorizeStepFrom([
    Routes.INTERACTION, // Standard flow
  ])
  @SetStep()
  @UseGuards(CsrfTokenGuard)
  async redirectToIdp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RedirectToIdp,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ): Promise<void> {
    const { email, rememberMe = false } = body;

    // TODO(douglasduteil): temporary solution to avoid blocking the user
    // We are testing the email validity without breaking the flow here
    await this.emailValidatorService.validate(email);

    const fqdn = this.fqdnService.getFqdnFromEmail(email);

    userSession.set('rememberMe', rememberMe);

    userSession.set('login_hint', email);

    const { identityProviderIds: idpIds } =
      await this.fqdnService.getFqdnConfigFromEmail(email);

    if (idpIds.length === 0) {
      throw new CoreFcaAgentNoIdpException();
    }

    if (idpIds.length > 1) {
      this.logger.debug(
        `${idpIds.length} identity providers matching for "****@${fqdn}"`,
      );
      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${Routes.IDENTITY_PROVIDER_SELECTION}`;

      return res.redirect(url);
    }

    const idpId = idpIds[0];

    const identityProvider = await this.identityProvider.getById(idpId);
    if (!identityProvider) {
      throw new CoreFcaIdpConfigurationException();
    }

    return this.coreFca.redirectToIdp(req, res, idpId);
  }

  /**
   * @TODO #141 implement proper well-known
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/141
   *  - generated by openid-client
   *  - pub keys orverrided by keys from HSM
   */
  @Get(Routes.WELL_KNOWN_KEYS)
  @Header('cache-control', 'public, max-age=600')
  @Track(TrackedEvent.IDP_REQUESTED_FC_JWKS)
  async getWellKnownKeys() {
    return await this.oidcClient.utils.wellKnownKeys();
  }

  @Post(Routes.DISCONNECT_FROM_IDP)
  @Header('cache-control', 'no-store')
  @Track(TrackedEvent.FC_REQUESTED_LOGOUT_FROM_IDP)
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

    return res.redirect(endSessionUrl);
  }

  @Get(Routes.CLIENT_LOGOUT_CALLBACK)
  @Header('cache-control', 'no-store')
  @Render('oidc-provider-logout-form')
  async redirectAfterIdpLogout(
    @Req() req: Request,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ) {
    const { oidcProviderLogoutForm } = userSession.get();

    await this.tracking.track(TrackedEvent.FC_SESSION_TERMINATED, { req });

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
  @AuthorizeStepFrom([
    Routes.REDIRECT_TO_IDP, // Standard flow
    Routes.IDENTITY_PROVIDER_SELECTION, // Multi-idp flow
    Routes.INTERACTION, // idp_hint flow
  ])
  @SetStep()
  async getOidcCallback(
    @Req() req: Request,
    @Res() res: Response,
    /**
     * @todo #1020 Partage d'une session entre oidc-provider & oidc-client
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1020
     * @ticket FC-1020
     */
    @UserSessionDecorator(GetOidcCallbackSessionDto)
    userSession: ISessionService<UserSession>,
  ) {
    // The session is duplicated here to mitigate cookie-theft-based attacks.
    // For more information, refer to: https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/1288
    await userSession.duplicate();

    const { idpId, idpNonce, idpState, interactionId, spId, spName } =
      userSession.get();

    // Remove nonce and state from session to prevent replay attacks
    userSession.set({ idpNonce: null, idpState: null });

    await this.tracking.track(TrackedEvent.IDP_CALLEDBACK, { req });
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

    await this.tracking.track(TrackedEvent.FC_REQUESTED_IDP_TOKEN, { req });

    const userInfoParams = {
      accessToken,
      idpId,
    };

    const plainIdpIdentity = await this.oidcClient.getUserinfo(userInfoParams);

    const idpIdentity = await this.sanitizer.getValidatedIdentityFromIdp(
      plainIdpIdentity,
      idpId,
    );

    const identityFqdn = this.fqdnService.getFqdnFromEmail(idpIdentity.email);

    const isAllowedIdpForEmail = await this.fqdnService.isAllowedIdpForEmail(
      idpId,
      idpIdentity.email,
    );

    if (!isAllowedIdpForEmail) {
      this.logger.warning(
        `Identity from "${idpId}" using "***@${identityFqdn}" is not allowed`,
      );
      await this.tracking.track(TrackedEvent.FC_FQDN_MISMATCH, { req });
    }

    const account = await this.accountService.getOrCreateAccount(
      idpId,
      idpIdentity.sub,
    );

    const spIdentity = await this.sanitizer.transformIdentity(
      idpIdentity,
      idpId,
      account.sub,
      acr,
    );

    userSession.set({
      amr,
      idpIdToken: idToken,
      idpAcr: acr,
      idpIdentity,
      spIdentity,
    });

    await this.tracking.track(TrackedEvent.FC_REQUESTED_IDP_USERINFO, { req });

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    res.redirect(url);
  }
}
