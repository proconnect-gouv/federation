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

@Controller()
export class CoreFcpController {
  constructor(private readonly oidcProviderService: OidcProviderService) {}

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid')
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    console.log('### NEST /interaction');

    const provider = this.oidcProviderService.getProvider();
    const { uid, prompt, params } = await provider.interactionDetails(req, res);

    return {
      uid,
      prompt,
      params,
    };
  }

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid/consent')
  @Render('consent')
  async getConsent(@Req() req, @Res() res) {
    console.log('### NEST /interaction/:uid/consent');

    const provider = this.oidcProviderService.getProvider();
    const { uid, prompt, params } = await provider.interactionDetails(req, res);
    return {
      uid,
      prompt,
      params,
    };
  }

  /** @TODO validate query by DTO */
  @Get('/interaction/:uid/login')
  async getLogin(@Req() req, @Res() res) {
    const provider = this.oidcProviderService.getProvider();

    const result = {
      login: {
        account: '42',
        acr: req.body.acr,
        amr: ['pwd'],
        ts: Math.floor(Date.now() / 1000),
      },
      consent: {
        rejectedScopes: [],
        rejectedClaims: [],
      },
    };

    return provider.interactionFinished(req, res, result);
  }

  // @Get('/redirect-to-idp')
  // getRedirectToIdp(): string {
  //   return this.coreFcpService.getRedirectToIdp();
  // }

  // @Get('/oidc-callback')
  // getOidcCallback(): string {
  //   return this.coreFcpService.getOidcCallback();
  // }
}
