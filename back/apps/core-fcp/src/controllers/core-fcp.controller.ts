import {
  Controller,
  Post,
  Get,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
  Body,
  Next,
} from '@nestjs/common';
import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/app';
import { CryptographyService } from '@fc/cryptography';
import { NotificationsService } from '@fc/notifications';
import { ScopesService } from '@fc/scopes';
import { ServiceProviderService } from '@fc/service-provider';
import {
  GetOidcCallback,
  OidcClientConfig,
  OidcClientRoutes,
  OidcClientService,
} from '@fc/oidc-client';
import {
  Interaction,
  CsrfToken,
  CoreRoutes,
  CoreMissingIdentityException,
  CoreInvalidCsrfException,
} from '@fc/core';
import { Core } from '../dto';
import { CoreFcpService } from '../services';

@Controller()
export class CoreFcpController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly core: CoreFcpService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly scopes: ScopesService,
    private readonly notifications: NotificationsService,
    private readonly oidcClient: OidcClientService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<Core>('Core');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    const { client_id: clientId } = params;
    const {
      idpFilterExclude,
      idpFilterList,
    } = await this.serviceProvider.getById(clientId);

    const providers = await this.identityProvider.getFilteredList(
      idpFilterList,
      idpFilterExclude,
    );
    const notifications = await this.notifications.getNotifications();

    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);
    return {
      uid,
      params,
      scope,
      providers,
      notifications,
      spName,
    };
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    await this.core.verify(req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${interactionId}/consent`);
  }

  @Get(CoreRoutes.INTERACTION_CONSENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('consent')
  async getConsent(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    const { spIdentity: identity, spName } = await this.session.get(
      interactionId,
    );

    const {
      params: { scope },
    } = await this.oidcProvider.getInteraction(req, res);
    const scopes = scope.split(' ');

    const csrfToken = await this.generateAndStoreCsrf(req.fc.interactionId);

    const claimsReadable = await this.scopes.mapScopesToLabel(scopes);

    return {
      interactionId,
      identity,
      spName,
      scopes,
      claims: claimsReadable,
      csrfToken,
    };
  }

  @Post(CoreRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(@Req() req, @Next() next, @Body() body: CsrfToken) {
    const { _csrf: csrf } = body;
    const { interactionId } = req.fc;
    const { spIdentity, csrfToken } = await this.session.get(interactionId);

    if (csrf !== csrfToken) {
      throw new CoreInvalidCsrfException();
    }

    if (!spIdentity) {
      throw new CoreMissingIdentityException();
    }

    // send the notification mail to the final user
    this.logger.debug('Sending authentication email to the end-user');
    await this.core.sendAuthenticationMail(req);

    // Pass the query to `@fc/oidc-provider` controller
    return next();
  }

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */
  @Get(OidcClientRoutes.OIDC_CALLBACK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getOidcCallback(
    @Req() req,
    @Res() res,
    @Param() params: GetOidcCallback,
  ) {
    const { providerUid } = params;

    const uid = req.fc.interactionId;
    const { idpState, idpNonce, spId } = await this.session.get(uid);

    await this.oidcClient.utils.checkIdpBlacklisted(spId, providerUid);

    const tokenParams = {
      providerUid,
      idpState,
      idpNonce,
    };
    const {
      accessToken,
      acr,
      amr,
    } = await this.oidcClient.getTokenFromProvider(tokenParams, req);

    const userInfoParams = {
      accessToken,
      providerUid,
    };

    const identity = await this.oidcClient.getUserInfosFromProvider(
      userInfoParams,
      req,
    );

    const identityExchange = {
      idpIdentity: identity,
      idpAcr: acr,
      amr,
      idpAccessToken: accessToken,
    };
    this.session.patch(uid, identityExchange);
    // BUSINESS: Redirect to business page
    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${uid}/verify`);
  }

  /**
   * @TODO #203
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/203
   */
  private async generateAndStoreCsrf(interactionId: string): Promise<string> {
    const csrfTokenLength = 32;
    const csrfToken = this.crypto.genRandomString(csrfTokenLength);
    await this.session.patch(interactionId, { csrfToken: csrfToken });
    return csrfToken;
  }
}
