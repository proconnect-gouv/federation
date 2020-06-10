import {
  Body,
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
import { CoreFcpService } from './core-fcp.service';
import { Interaction } from './dto/interaction.dto';

@Controller()
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

  @Get('/interaction/:uid')
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

  @Get('/interaction/:uid/verify')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getVerify(@Req() req, @Res() res, @Param() _params: Interaction) {
    const { interactionId } = req;
    await this.coreFcp.verify(req);

    res.redirect(`/interaction/${interactionId}/consent`);
  }

  @Get('/interaction/:uid/consent')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('consent')
  async getConsent(@Req() req, @Param() _params: Interaction) {
    const { interactionId } = req;
    const { spIdentity: identity } = await this.session.get(interactionId);

    return { interactionId, identity };
  }

  @Get('/interaction/:uid/login')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getLogin(
    @Req() req,
    @Res() res,
    @Body() body,
    @Param() _params: Interaction,
  ) {
    const { uid } = await this.oidcProvider.getInteraction(req, res);

    this.logger.debug('Sending authentication email to the end-user');
    // send the notification mail to the final user
    await this.coreFcp.sendAuthenticationMail(req);

    /**
     * @todo #130 Add a DTO to test the result of the interaction
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/130
     */
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
