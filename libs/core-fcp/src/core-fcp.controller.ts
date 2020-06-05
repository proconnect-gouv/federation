import {
  Body,
  Controller,
  Get,
  Render,
  Req,
  Res,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';

import { OidcProviderService } from '@fc/oidc-provider';
import { LoggerService } from '@fc/logger';
import { IdentityProviderService } from '@fc/identity-provider';
import { SessionService } from '@fc/session';
import { CoreFcpService } from './core-fcp.service';
import { ServiceProviderService } from '@fc/service-provider';

@Controller()
export class CoreFcpController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly serviceProvider: ServiceProviderService,
    private readonly coreFcp: CoreFcpService,
    private readonly session: SessionService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get('/interaction/:uid')
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const { client_id: spId, acr_values: spAcr } = params;
    const providers = await this.identityProvider.getList();

    const { name: spName } = await this.serviceProvider.getById(spId);

    this.session.store(uid, {
      spId,
      spAcr,
      spName,
    });

    return {
      uid,
      params,
      providers,
    };
  }

  @Get('/interaction/:uid/verify')
  async getVerify(@Req() req, @Res() res) {
    const { interactionId } = req;
    await this.coreFcp.verify(req);

    res.redirect(`/interaction/${interactionId}/consent`);
  }

  @Get('/interaction/:uid/consent')
  @Render('consent')
  async getConsent(@Req() req) {
    const { interactionId } = req;
    const { spIdentity: identity } = await this.session.get(interactionId);

    return { interactionId, identity };
  }

  /** @TODO validate body by DTO */
  @Get('/interaction/:uid/login')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  async getLogin(@Req() req, @Res() res, @Body() body) {
    const { uid } = await this.oidcProvider.getInteraction(req, res);

    this.logger.debug('Sending authentication email to the end-user');
    /** @todo Use SP and IdP names instead of ids */
    // send the notification mail to the final user
    await this.coreFcp.sendAuthenticationMail(req);

    const result = {
      login: {
        account: uid,
        acr: body.acr,
        amr: ['pwd'],
        ts: Math.floor(Date.now() / 1000),
      },
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    return this.oidcProvider.finishInteraction(req, res, result);
  }
}
