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
import { NotificationsService } from 'libs/notifications/src';
import { OidcClientConfig } from '@fc/oidc-client';
import { ScopesService } from '@fc/scopes';
import {
  Interaction,
  CsrfToken,
  Core,
  CoreRoutes,
  CoreMissingIdentity,
  CoreInvalidCsrfException,
} from '@fc/core';
import { CoreFcpService } from './core-fcp.service';

@Controller()
export class CoreFcpController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly core: CoreFcpService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly scopes: ScopesService,
    private readonly notifications: NotificationsService,
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
    const providers = await this.identityProvider.getList();
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
      throw new CoreMissingIdentity();
    }

    // send the notification mail to the final user
    this.logger.debug('Sending authentication email to the end-user');
    await this.core.sendAuthenticationMail(req);

    // Pass the query to `@fc/oidc-provider` controller
    return next();
  }

  /**
   * @TODO #203 ETQ dev, je crée une lib de gestion de CSRF
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/203
   */
  private async generateAndStoreCsrf(interactionId: string): Promise<string> {
    const csrfTokenLength = 32;
    const csrfToken = this.crypto.genRandomString(csrfTokenLength);
    await this.session.patch(interactionId, { csrfToken: csrfToken });
    return csrfToken;
  }
}
