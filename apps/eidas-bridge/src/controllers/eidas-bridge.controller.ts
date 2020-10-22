import { Controller, Get, Render, Res, Req, Query } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
import { SessionService } from '@fc/session';
import { EidasBridgeRoutes } from '../enums';
import { EidasBridgeLoginCallbackException } from '../exceptions';

@Controller()
export class EidasBridgeController {
  constructor(
    private readonly config: ConfigService,
    private readonly crypto: CryptographyService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly session: SessionService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(EidasBridgeRoutes.DEFAULT)
  @Render('default')
  async getDefault(@Res() res) {
    /**
     * @TODO #179
     * This is just a mock, so we don't bother making this configurable...
     * We'll soon update session system to handle all this init stuff automatically anyway.
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/179
     */
    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);
    await this.session.init(res, sessionId, { idpState: sessionId });
    const message = 'Bienvenue sur le Bridge Eidas';

    return {
      message,
      state: sessionId,
      titleFront: 'Eidas Bridge',
    };
  }

  /* @TODO #251
   * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
   * */
  @Get(EidasBridgeRoutes.LOGIN)
  async login(@Req() req, @Res() res) {
    const params = {
      scope:
        'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address',
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

  @Get(EidasBridgeRoutes.LOGIN_CALLBACK)
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
        titleFront: 'Eidas Bridge - Login Callback',
        idpIdentity,
      };
    } catch (e) {
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new EidasBridgeLoginCallbackException(e);
    }
  }

  @Get('/error')
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Eidas Bridge - Erreur lors de l'authentification",
      ...query,
    };
  }
}
