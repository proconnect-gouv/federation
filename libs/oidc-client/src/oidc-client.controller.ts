import { Controller, Get, Inject, Req, Res, Body, Post } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { IIdentityManagementService } from './interfaces';
import { IDENTITY_MANAGEMENT_SERVICE } from './tokens';

import { OidcClientService } from './oidc-client.service';

@Controller('/api/v2')
export class OidcClientController {
  constructor(
    private readonly oidcClientService: OidcClientService,
    private readonly logger: LoggerService,
    @Inject(IDENTITY_MANAGEMENT_SERVICE)
    private readonly identityManagementService: IIdentityManagementService,
  ) {}

  /** @TODO validation body by DTO */
  @Post('/redirect-to-idp')
  async redirectToIdp(@Req() req, @Res() res, @Body() body) {
    this.logger.debug('/api/v2/redirect-to-idp');

    req.session.uid = body.uid;

    const authorizationUrl = await this.oidcClientService.getAuthorizeUrl(
      body,
      req,
    );

    res.redirect(authorizationUrl);
  }

  /** @TODO valiate input by DTO */
  @Get('/oidc-callback')
  async getOidcCallback(@Req() req, @Res() res) {
    this.logger.debug('/api/v2/oidc-callback');

    const { uid } = req.session;

    const {
      access_token: accessToken,
    } = await this.oidcClientService.getTokenSet(req);

    const user = await this.oidcClientService.getUserInfo(accessToken);

    this.identityManagementService.storeIdentity(uid, user);

    // pas sur de la fin de la cinématique
    res.redirect(`/interaction/${req.session.uid}/consent`);
  }

  @Get('logout-callback')
  getLogoutCallback() {
    // retourne sur le FS une fois la session du FI terminé
  }
}
