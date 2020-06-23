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
import { CoreFcpService } from '../services';
import { Interaction } from '../dto';
import { CoreFcpRoutes } from '../enums';

@Controller('/api/v2')
export class CoreFcpController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly coreFcp: CoreFcpService,
    private readonly session: SessionService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(CoreFcpRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const providers = await this.identityProvider.getList();

    return {
      uid,
      params,
      providers,
    };
  }

  @Get(CoreFcpRoutes.INTERACTION_VERIFY)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    await this.coreFcp.verify(req);

    res.redirect(`/api/v2/interaction/${interactionId}/consent`);
  }

  @Get(CoreFcpRoutes.INTERACTION_CONSENT)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('consent')
  async getConsent(@Req() req, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    const { spIdentity: identity } = await this.session.get(interactionId);

    return { interactionId, identity };
  }

  @Get(CoreFcpRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req.fc;
    const { spAcr } = await this.session.get(interactionId);

    this.logger.debug('Sending authentication email to the end-user');
    // send the notification mail to the final user
    await this.coreFcp.sendAuthenticationMail(req);

    /**
     * Build Interaction results
     * For all available options, refer to `oidc-provider` documentation:
     * @see https://github.com/panva/node-oidc-provider/blob/master/docs/README.md#user-flows
     */
    const result = {
      login: {
        account: interactionId,
        acr: spAcr,
        ts: Math.floor(Date.now() / 1000),
      },
      /**
       * We need to return this information, it will always be empty arrays
       * since franceConnect does not allow for partial authorizations yet,
       * it's an "all or nothing" consent.
       */
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    return this.oidcProvider.finishInteraction(req, res, result);
  }
}
