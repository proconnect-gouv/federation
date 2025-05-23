import { Request, Response } from 'express';
import { cloneDeep } from 'lodash';

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

import { validateDto } from '@fc/common';
import { ConfigService } from '@fc/config';
import { CoreRoutes } from '@fc/core';
import { UserSessionDecorator } from '@fc/core-fca/decorators';
import { CryptographyService } from '@fc/cryptography';
import { CsrfService, CsrfTokenGuard } from '@fc/csrf';
import { EmailValidatorService } from '@fc/email-validator/services';
import { AuthorizeStepFrom, SetStep } from '@fc/flow-steps';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import {
  OidcClientConfigService,
  OidcClientRoutes,
  OidcClientService,
} from '@fc/oidc-client';
import { ISessionService, SessionService } from '@fc/session';
import {
  Track,
  TrackedEventContextInterface,
  TrackingService,
} from '@fc/tracking';

import {
  AppConfig,
  GetIdentityProviderSelectionSessionDto,
  GetOidcCallbackSessionDto,
  IdentityForSpDto,
  IdentityFromIdpDto,
  RedirectToIdp,
  UserSession,
} from '../dto';
import { CoreFcaRoutes } from '../enums/core-fca-routes.enum';
import { CoreFcaAgentNoIdpException } from '../exceptions';
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

  @Get(CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION)
  @Header('cache-control', 'no-store')
  @AuthorizeStepFrom([
    CoreRoutes.INTERACTION, // Standard flow
    OidcClientRoutes.REDIRECT_TO_IDP, // Navigation back
  ])
  @SetStep()
  async getIdentityProviderSelection(
    @Res() res: Response,
    @UserSessionDecorator(GetIdentityProviderSelectionSessionDto)
    userSession: ISessionService<UserSession>,
  ) {
    const { login_hint: email } = userSession.get();
    const fqdnConfig = await this.fqdnService.getFqdnConfigFromEmail(email);
    const { acceptsDefaultIdp, identityProviders } = fqdnConfig;

    const providers: { title: string; uid: string }[] =
      await this.coreFca.getIdentityProvidersByIds(identityProviders);

    // replace default idp title by "Autre"
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    providers.map((provider) => {
      if (provider.uid === defaultIdpId) {
        provider.title = 'Autre';
      }
    });

    const csrfToken = this.csrfService.renew();
    this.sessionService.set('Csrf', { csrfToken });

    const response = {
      acceptsDefaultIdp,
      csrfToken,
      email,
      providers,
    };

    res.render('interaction-identity-provider', response);
  }

  /**
   * @todo #242 get configured parameters (scope and acr)
   */
  @Post(OidcClientRoutes.REDIRECT_TO_IDP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Header('cache-control', 'no-store')
  @AuthorizeStepFrom([
    CoreRoutes.INTERACTION, // Standard flow
    CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION, // Multi-idp flow
  ])
  @SetStep()
  @Track('IDP_CHOSEN')
  @UseGuards(CsrfTokenGuard)
  async redirectToIdp(
    @Req() req: Request,
    @Res() res: Response,
    @Body() body: RedirectToIdp,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ): Promise<void> {
    // if email is set, this controller is called from the interaction page
    // if identityProviderUid is set, this controller is called directly from the sp page via idp_hint or from the select-idp page
    const { email, identityProviderUid } = body;

    // TODO(douglasduteil): temporary solution to avoid blocking the user
    // We are testing the email validity without breaking the flow here
    await this.emailValidatorService.validate(email);

    const fqdn = this.fqdnService.getFqdnFromEmail(email);

    userSession.set('login_hint', email);

    let idpName: string;
    let idpLabel: string;
    let idpId: string;
    if (identityProviderUid) {
      const { name, title } =
        await this.identityProvider.getById(identityProviderUid);
      idpName = name;
      idpLabel = title;
      idpId = identityProviderUid;
      this.logger.debug(
        `Redirect "****@${fqdn}" to selected idp "${idpLabel}" (${idpId})`,
      );
    } else {
      const { identityProviders } =
        await this.fqdnService.getFqdnConfigFromEmail(email);

      if (identityProviders.length === 0) {
        throw new CoreFcaAgentNoIdpException();
      }

      if (identityProviders.length > 1) {
        this.logger.debug(
          `${identityProviders.length} identity providers matching for "****@${fqdn}"`,
        );
        const { urlPrefix } = this.config.get<AppConfig>('App');
        const url = `${urlPrefix}${CoreFcaRoutes.INTERACTION_IDENTITY_PROVIDER_SELECTION}`;

        return res.redirect(url);
      }

      idpId = identityProviders[0];

      const { name, title } = await this.identityProvider.getById(idpId);
      idpName = name;
      idpLabel = title;
      this.logger.debug(
        `Redirect "****@${fqdn}" to unique idp "${idpLabel}" (${idpId})`,
      );
    }

    const trackingContext: TrackedEventContextInterface = {
      req,
      fqdn,
      idpId: idpId,
      idpLabel: idpLabel,
      idpName: idpName,
    };
    const { FC_REDIRECT_TO_IDP } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_REDIRECT_TO_IDP, trackingContext);

    return this.coreFca.redirectToIdp(req, res, idpId);
  }

  /**
   * @TODO #141 implement proper well-known
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/141
   *  - generated by openid-client
   *  - pub keys orverrided by keys from HSM
   */
  @Get(OidcClientRoutes.WELL_KNOWN_KEYS)
  @Header('cache-control', 'public, max-age=600')
  @Track('IDP_REQUESTED_FC_JWKS')
  async getWellKnownKeys() {
    return await this.oidcClient.utils.wellKnownKeys();
  }

  @Post(OidcClientRoutes.DISCONNECT_FROM_IDP)
  @Header('cache-control', 'no-store')
  @Track('FC_REQUESTED_LOGOUT_FROM_IDP')
  async logoutFromIdp(
    @Res() res,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ) {
    const { idpIdToken, idpId } = userSession.get();

    const { stateLength } = await this.oidcClientConfig.get();
    const idpState: string = this.crypto.genRandomString(stateLength);

    const endSessionUrl: string =
      await this.oidcClient.getEndSessionUrlFromProvider(
        idpId,
        idpState,
        idpIdToken,
      );

    return res.redirect(endSessionUrl);
  }

  @Get(OidcClientRoutes.CLIENT_LOGOUT_CALLBACK)
  @Header('cache-control', 'no-store')
  @Render('oidc-provider-logout-form')
  async redirectAfterIdpLogout(
    @Req() req,
    @Res() res,
    @UserSessionDecorator()
    userSession: ISessionService<UserSession>,
  ) {
    const { oidcProviderLogoutForm } = userSession.get();

    const trackingContext: TrackedEventContextInterface = { req };
    const { FC_SESSION_TERMINATED } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_SESSION_TERMINATED, trackingContext);

    await userSession.destroy();

    return { oidcProviderLogoutForm };
  }

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */
  @Get(OidcClientRoutes.OIDC_CALLBACK)
  @Header('cache-control', 'no-store')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @AuthorizeStepFrom([
    OidcClientRoutes.REDIRECT_TO_IDP, // Standard flow
    CoreRoutes.INTERACTION, // idp_hint flow
  ])
  @SetStep()
  async getOidcCallback(
    @Req() req,
    @Res() res,
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

    const { idpId, idpNonce, idpState, interactionId, spId, login_hint } =
      userSession.get();
    // Remove nonce and state from session to prevent replay attacks
    userSession.set({ idpNonce: null, idpState: null });

    const fqdn = this.fqdnService.getFqdnFromEmail(login_hint);
    const { IDP_CALLEDBACK } = this.tracking.TrackedEventsMap;
    await this.tracking.track(IDP_CALLEDBACK, { req, fqdn, email: login_hint });
    const tokenParams = {
      state: idpState,
      nonce: idpNonce,
    };

    const extraParams = {
      sp_id: spId,
    };

    const { accessToken, idToken, acr, amr } =
      await this.oidcClient.getTokenFromProvider(
        idpId,
        tokenParams,
        req,
        extraParams,
      );

    const { FC_REQUESTED_IDP_TOKEN } = this.tracking.TrackedEventsMap;
    await this.tracking.track(FC_REQUESTED_IDP_TOKEN, {
      req,
      fqdn,
      email: login_hint,
    });

    const userInfoParams = {
      accessToken,
      idpId,
    };

    const identity =
      await this.oidcClient.getUserInfosFromProvider<IdentityFromIdpDto>(
        userInfoParams,
        req,
      );

    const { FC_REQUESTED_IDP_USERINFO } = this.tracking.TrackedEventsMap;
    const identityFqdn = this.fqdnService.getFqdnFromEmail(identity.email);

    await this.tracking.track(FC_REQUESTED_IDP_USERINFO, {
      req,
      fqdn: identityFqdn,
      email: identity.email,
      idpSub: identity.sub,
    });

    const errors = await validateDto(
      identity,
      IdentityForSpDto,
      { forbidUnknownValues: true },
      { excludeExtraneousValues: true },
    );

    let transformedIdentity = identity;

    if (errors.length > 0) {
      transformedIdentity = await this.sanitizer.sanitize(
        identity,
        idpId,
        errors,
      );
    }

    const isAllowedIdpForEmail = await this.fqdnService.isAllowedIdpForEmail(
      idpId,
      transformedIdentity.email,
    );

    if (!isAllowedIdpForEmail) {
      this.logger.warning(
        `Identity from "${idpId}" using "***@${identityFqdn}" is not allowed`,
      );
      const { FC_FQDN_MISMATCH } = this.tracking.TrackedEventsMap;
      await this.tracking.track(FC_FQDN_MISMATCH, {
        req,
        fqdn: identityFqdn,
      });
    }

    const identityExchange: UserSession = cloneDeep({
      amr,
      idpIdToken: idToken,
      idpAcr: acr,
      idpIdentity: transformedIdentity,
    });
    userSession.set(identityExchange);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    const url = `${urlPrefix}/interaction/${interactionId}/verify`;

    res.redirect(url);
  }
}
