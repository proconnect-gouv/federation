import { Controller, Get, Req, Res, Body, Post } from '@nestjs/common';
import { OidcClientService } from './oidc-client.service';

@Controller('/api/v2')
export class OidcClientController {
  constructor(private readonly oidcClientService: OidcClientService) {}

  // @TODO: validation body by DTO
  @Post('/redirect-to-idp')
  async redirectToIdp(@Req() req, @Res() res, @Body() body) {
    console.log('### NEST /api/v2/redirect-to-idp');
    // how retrieve & keep uid (session / redis / autre)
    req.session.uid = body.uid;
    
    const authorizationUrl = await this.oidcClientService.getAuthorizeUrl(body, req);
    
    res.redirect(authorizationUrl);
  }

  @Get('/oidc-callback')
  async getOidcCallback(@Req() req, @Res() res) {
    console.log('### NEST /api/v2/oidc-callback');

    const {
      access_token: accessToken,
      id_token: idToken,
    } = await this.oidcClientService.getTokenSet(req);

    const user = await this.oidcClientService.getUserInfo(accessToken);

    req.session.user = user;
    req.session.idToken = idToken;

    // pas sur de la fin de la cinématique
    res.redirect(`/interaction/${req.session.uid}/consent`);
  }

  @Get('logout-callback')
  getLogoutCallback() {
    // retourne sur le FS une fois la session du FI terminé
  }
}
