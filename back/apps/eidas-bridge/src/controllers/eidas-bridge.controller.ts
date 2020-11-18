import {
  Controller,
  Get,
  Render,
  Res,
  Req,
  Query,
  UsePipes,
  ValidationPipe,
  Param,
  Post,
} from '@nestjs/common';

import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { Interaction } from '@fc/core';
import { EidasBridgeRoutes } from '../enums';
import { EidasBridgeLoginCallbackException } from '../exceptions';

@Controller()
export class EidasBridgeController {
  constructor(
    private readonly crypto: CryptographyService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly session: SessionService,
    private readonly oidcProvider: OidcProviderService,
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
   *
   */
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

  @Get(EidasBridgeRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);

    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);
    return {
      uid,
      params,
      spName,
    };
  }

  /**
   * @todo ajouter une interface sur l'identité au format oidc
   */
  @Post(EidasBridgeRoutes.INTERACTION_LOGIN)
  async getLogin(
    @Req() req,
    @Res() res,
    @Param() param: Interaction,
  ): Promise<void> {
    const identity = {
      sub: 'b155a2129530e5fd3f6b95275b6da72a99ea1a486b8b33148abb4a62ddfb3609v2',
      gender: 'female',
      birthdate: '1962-08-24',
      birthcountry: '99100',
      birthplace: '75107',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      given_name: 'Angela Claire Louise',
      // eslint-disable-next-line @typescript-eslint/naming-convention
      family_name: 'DUBOIS',
      address: {
        country: 'France',
        formatted: 'France Paris 75107 20 avenue de Ségur',
        locality: 'Paris',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        postal_code: '75107',
        // eslint-disable-next-line @typescript-eslint/naming-convention
        street_address: '20 avenue de Ségur',
      },
      aud: 'myclientidforeidas-bridge',
      exp: 1605004505,
      iat: 1605004445,
      iss: 'https://corev2.docker.dev-franceconnect.fr/api/v2',
    };
    const spIdentity = {
      ...identity,
      sub: identity.sub,
    };

    // Save in session
    /**
     * @todo set the eIDAS level in a configuration file
     */
    const spAcr = 'eidas2';

    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);

    this.session.init(res, param.uid, {
      sessionId,
      spIdentity,
    });

    const result = {
      login: {
        account: param.uid,
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

  @Get('/error')
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Eidas Bridge - Erreur lors de l'authentification",
      ...query,
    };
  }
}
