import { Controller, Get, Res, Req, Render, Query } from '@nestjs/common';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { MockServiceProviderRoutes } from './enums';
import { MockServiceProviderLoginCallbackException } from './exceptions';

@Controller()
export class MockServiceProviderController {
  constructor(
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @Render('index')
  async index() {
    return {
      titleFront: 'Mock Service Provider',
    };
  }

  @Get(MockServiceProviderRoutes.LOGIN)
  async login(@Res() res) {
    // acr_values is an oidc defined variable name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const scope =
      'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address';
    const providerUid = 'corev2';
    const acrValues = 'eidas2';

    const authorizationUrl = await this.oidcClient.getAuthorizeUrl(
      scope,
      providerUid,
      acrValues,
    );

    res.redirect(authorizationUrl);
  }

  @Get(MockServiceProviderRoutes.LOGIN_CALLBACK)
  @Render('login-callback')
  async loginCallback(@Req() req, @Res() res) {
    try {
      const providerUid = 'corev2';

      // OIDC: call idp's /token endpoint
      const tokenSet = await this.oidcClient.getTokenSet(req, providerUid);
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { access_token: accessToken } = tokenSet;

      // OIDC: call idp's /userinfo endpoint
      const idpIdentity = await this.oidcClient.getUserInfo(
        accessToken,
        providerUid,
      );

      /** @TODO
       * save 'tokenSet.id_token' in session for logout
       * save idpIentity in session
       * */

      return {
        titleFront: 'Mock Service Provider - Login Callback',
        idpIdentity,
      };
    } catch (e) {
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new MockServiceProviderLoginCallbackException(e);
    }
  }

  @Get(MockServiceProviderRoutes.LOGOUT)
  async logout(@Res() res) {
    res.redirect(MockServiceProviderRoutes.LOGOUT_CALLBACK);
  }

  @Get(MockServiceProviderRoutes.LOGOUT_CALLBACK)
  async logoutCallback(@Res() res) {
    /** @TODO remove sp session */
    return res.redirect('/');
  }

  @Get('/error')
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Mock service provider - Erreur lors de l'authentification",
      ...query,
    };
  }
}
