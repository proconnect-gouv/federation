import { Controller, Get, Res, Req, Render, Query } from '@nestjs/common';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { MockServiceProviderRoutes } from './enums';
import { MockServiceProviderLoginCallbackException } from './exceptions';
import { CryptographyService } from '@fc/cryptography';

@Controller()
export class MockServiceProviderController {
  constructor(
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly crypto: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @Render('index')
  async index(@Res() res) {
    /**
     * @TODO #179
     * This is just a mock, so we don't bother making this configurable...
     * We'll soon update session system to handle all this init stuff automatically anyway.
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/179
     */
    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);
    await this.session.init(res, sessionId, { idpState: sessionId });

    return {
      titleFront: 'Mock Service Provider',
      state: sessionId,
    };
  }

  /**
   * @todo Use an env var to hestimate if the providerUid to use
   * should be 'fca' or 'corev2'
   */
  @Get(MockServiceProviderRoutes.LOGIN)
  async login(@Req() req, @Res() res) {
    const params = {
      scope:
        'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address',
      //providerUid: 'fca',
      providerUid: 'corev2',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: 'eidas2',
    };

    const {
      state,
      scope,
      providerUid,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
    } = this.oidcClient.buildAuthorizeParameters(params);

    const authorizationUrl = await this.oidcClient.getAuthorizeUrl(
      state,
      scope,
      providerUid,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
    );

    const sessionId = this.session.getId(req);
    await this.session.patch(sessionId, { idpState: state });

    res.redirect(authorizationUrl);
  }

  @Get(MockServiceProviderRoutes.LOGIN_CALLBACK)
  @Render('login-callback')
  async loginCallback(@Req() req, @Res() res, @Query() query) {
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { error, error_description } = query;
    if (error) {
      return res.redirect(
        `/error?error=${error}&error_description=${error_description}`,
      );
    }

    try {
      const providerUid = 'corev2';
      const sessionId = this.session.getId(req);

      const { idpState } = await this.session.get(sessionId);

      // OIDC: call idp's /token endpoint
      const tokenSet = await this.oidcClient.getTokenSet(
        req,
        providerUid,
        idpState,
      );
      // openid defined property names
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { access_token: accessToken } = tokenSet;

      // OIDC: call idp's /userinfo endpoint
      const idpIdentity = await this.oidcClient.getUserInfo(
        accessToken,
        providerUid,
      );

      /** @TODO #192
       * ETQ Dev, je complète la session pendant la cinématique des mocks
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/192
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
    /** @TODO #192
     * ETQ Dev, je complète la session pendant la cinématique des mocks
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/192
     * */
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
