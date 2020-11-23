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
import { AppConfig } from '@fc/app';
import { Interaction, Core, CoreRoutes, CoreMissingIdentity } from '@fc/core';
import { CoreFcaService } from './core-fca.service';

@Controller()
export class CoreFcaController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
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

  @Get(CoreRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const providers = await this.identityProvider.getList();

    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);

    return {
      uid,
      params,
      providers,
      spName,
    };
  }

  @Get(CoreRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    await this.core.verify(req);

    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${interactionId}/login`);
  }

  /**
   * @TODO Remove this controller once it is globaly available in `@fc/oidc-provider`
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/merge_requests/185
   */
  @Get(CoreRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    const { spIdentity } = await this.session.get(interactionId);
    if (!spIdentity) {
      throw new CoreMissingIdentity();
    }

    return this.oidcProvider.finishInteraction(req, res);
  }
}
