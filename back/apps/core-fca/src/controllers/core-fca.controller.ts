import {
  Controller,
  Get,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
  Param,
} from '@nestjs/common';

import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { MinistriesService } from '@fc/ministries';
import { AppConfig } from '@fc/app';
import { OidcClientConfig } from '@fc/oidc-client';
import { Interaction, Core, CoreRoutes, CoreMissingIdentity } from '@fc/core';
import { CoreFcaService } from '../services';

@Controller()
export class CoreFcaController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly ministries: MinistriesService,
    private readonly core: CoreFcaService,
    private readonly session: SessionService,
    private readonly config: ConfigService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreRoutes.DEFAULT)
  getDefault(@Res() res) {
    const { defaultRedirectUri } = this.config.get<Core>('Core');
    res.redirect(301, defaultRedirectUri);
  }

  @Get(CoreRoutes.FCA_FRONT_DATAS)
  async getFrontData(@Req() req, @Res() res) {
    const { params } = await this.oidcProvider.getInteraction(req, res);
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { acr_values, redirect_uri, response_type } = params;
    const redirectToIdentityProviderInputs = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      redirect_uri,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      response_type,
      scope,
    };

    const ministries = await this.ministries.getList();

    const identityProvidersList = await this.identityProvider.getList();
    const identityProviders = identityProvidersList.map(
      ({ active, display, title, uid }) => ({
        active,
        display,
        name: title,
        uid,
      }),
    );

    const { interactionId } = req.fc;

    const { spName } = await this.session.get(interactionId);

    return res.json({
      redirectToIdentityProviderInputs,
      redirectURL: '/api/v2/redirect-to-idp',
      ministries,
      identityProviders,
      serviceProviderName: spName,
    });
  }

  @Get(CoreRoutes.INTERACTION)
  @Render('interaction')
  async getInteraction() {
    return {};
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    await this.core.verify(req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/login`);
  }

  /**
   * @TODO #185 Remove this controller once it is globaly available in `@fc/oidc-provider`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/185
   */
  @Get(CoreRoutes.INTERACTION_LOGIN)
  async getLogin(@Req() req, @Res() res) {
    const { interactionId } = req.fc;
    const { spIdentity } = await this.session.get(interactionId);
    if (!spIdentity) {
      throw new CoreMissingIdentity();
    }

    return this.oidcProvider.finishInteraction(req, res);
  }
}
