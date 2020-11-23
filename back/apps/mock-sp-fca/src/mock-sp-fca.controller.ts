import {
  Controller,
  Get,
  Res,
  Req,
  Render,
  Query,
  Body,
  Post,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { OidcClientService } from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { MockSpFcaRoutes } from './enums';
import {
  MockSpFcaLoginCallbackException,
  MockSpFcaTokenRevocationException,
  MockSpFcaUserinfoException,
} from './exceptions';
import { AccessTokenParamsDTO } from './dto';

@Controller()
export class MockSpFcaController {
  constructor(
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly crypto: CryptographyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(MockSpFcaRoutes.DEFAULT)
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
   * @TODO #251
   * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
   */
  @Get(MockSpFcaRoutes.LOGIN)
  async login(@Req() req, @Res() res) {
    /**
     * @TODO #251
     * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
     */
    const params = {
      scope:
        'openid gender birthdate birthcountry birthplace given_name family_name email preferred_username address usual_name siret organizational_unit',
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
    } = await this.oidcClient.buildAuthorizeParameters(params);

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

  @Get(MockSpFcaRoutes.LOGIN_CALLBACK)
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
      /**
       * @TODO #251
       * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
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

      const { acr } = tokenSet.claims();
      return {
        titleFront: 'Mock Service Provider - Login Callback',
        idpIdentity,
        accessToken,
        acr,
      };
    } catch (e) {
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new MockSpFcaLoginCallbackException(e);
    }
  }

  @Get(MockSpFcaRoutes.LOGOUT)
  async logout(@Res() res) {
    res.redirect(MockSpFcaRoutes.LOGOUT_CALLBACK);
  }

  @Get(MockSpFcaRoutes.LOGOUT_CALLBACK)
  async logoutCallback(@Res() res) {
    /** @TODO #192
     * ETQ Dev, je complète la session pendant la cinématique des mocks
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/192
     * */
    return res.redirect('/');
  }

  @Post(MockSpFcaRoutes.REVOCATION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('success-revoke-token')
  async revocationToken(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251
       * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'corev2';
      const { accessToken } = body;
      await this.oidcClient.revokeToken(accessToken, providerUid);

      return {
        titleFront: 'Mock Service Provider - Token révoqué',
        accessToken,
      };
    } catch (e) {
      /**
       * @params e.error : error return by panva lib
       * @params e.error_description : error description return by panva lib
       *
       * If exception is not return by panva, we throw our custom class exception
       * when we try to revoke the token : 'MockServiceProviderTokenRevocationException'
       */
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new MockSpFcaTokenRevocationException(e);
    }
  }

  @Post(MockSpFcaRoutes.USERINFO)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('login-callback')
  async retrieveUserinfo(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251
       * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'corev2';
      const { accessToken } = body;
      // OIDC: call idp's /userinfo endpoint
      const idpIdentity = await this.oidcClient.getUserInfo(
        accessToken,
        providerUid,
      );

      return {
        titleFront: 'Mock Service Provider - Userinfo',
        accessToken,
        idpIdentity,
      };
    } catch (e) {
      /**
       * @params e.error : error return by panva lib
       * @params e.error_description : error description return by panva lib
       *
       * If exception is not return by panva, we throw our custom class exception
       * when we try to receive userinfo : 'MockServiceProviderUserinfoException'
       */
      if (e.error && e.error_description) {
        return res.redirect(
          `/error?error=${e.error}&error_description=${e.error_description}`,
        );
      }
      throw new MockSpFcaUserinfoException(e);
    }
  }

  @Get(MockSpFcaRoutes.ERROR)
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Mock service provider - Erreur lors de l'authentification",
      ...query,
    };
  }
}
