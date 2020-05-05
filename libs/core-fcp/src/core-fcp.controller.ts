import {
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
import { CoreFcpService } from './core-fcp.service';

@Controller()
export class CoreFcpController {
  constructor(
    private readonly logger: LoggerService,
    private readonly oidcProvider: OidcProviderService,
    private readonly identityProvider: IdentityProviderService,
    private readonly coreFcp: CoreFcpService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    this.logger.debug('/interaction/:uid');

    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    const providers = await this.identityProvider.getList();

    return {
      uid,
      params,
      providers,
    };
  }

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid/consent')
  @Render('consent')
  async getConsent(@Req() req, @Res() res) {
    this.logger.debug('/interaction/:uid/consent');
    return this.coreFcp.getConsent(req, res);
  }

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid/login')
  async getLogin(@Req() req, @Res() res) {
    const { uid } = await this.oidcProvider.getInteraction(req, res);

    const result = {
      login: {
        account: uid,
        acr: req.body.acr,
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
