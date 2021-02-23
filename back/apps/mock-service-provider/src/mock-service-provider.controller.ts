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
import {
  OidcClientService,
  OidcClientConfig,
  IdentityProviderMetadata,
} from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { IdentityProviderEnvService } from '@fc/identity-provider-env';
import { MockServiceProviderRoutes } from './enums';
import {
  MockServiceProviderTokenRevocationException,
  MockServiceProviderUserinfoException,
} from './exceptions';
import { AccessTokenParamsDTO } from './dto';

@Controller()
export class MockServiceProviderController {
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly crypto: CryptographyService,
    private readonly identityProvider: IdentityProviderEnvService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @Render('index')
  async index(@Res() res) {
    // Only one provider is available with `@fc/identity-provider-env`
    const [provider] = await this.identityProvider.getList();

    const { authorizationUrl, params } = await this.getInteractionParameters(
      provider,
    );

    /**
     * @TODO #179
     * This is just a mock, so we don't bother making this configurable...
     * We'll soon update session system to handle all this init stuff automatically anyway.
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/179
     */
    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);
    await this.session.init(res, sessionId, {
      idpState: params.state,
      idpNonce: params.nonce,
    });

    return {
      titleFront: 'Mock Service Provider',
      params,
      authorizationUrl: authorizationUrl,
    };
  }

  @Get('/interaction/:uid/verify')
  @Render('login-callback')
  async getVerify(@Req() req) {
    const sessionId = this.session.getId(req);
    const session = await this.session.get(sessionId);

    return {
      ...session,
      accessToken: session.idpAccessToken,
      titleFront: 'Mock Service Provider - Login Callback',
    };
  }

  @Get(MockServiceProviderRoutes.LOGOUT)
  async logout(@Res() res) {
    res.redirect(MockServiceProviderRoutes.LOGOUT_CALLBACK);
  }

  @Get(MockServiceProviderRoutes.LOGOUT_CALLBACK)
  async logoutCallback(@Res() res) {
    /**
     * @TODO #192 ETQ Dev, je complète la session pendant la cinématique des mocks
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/192
     * */
    return res.redirect('/');
  }

  @Post(MockServiceProviderRoutes.REVOCATION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('success-revoke-token')
  async revocationToken(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'envIssuer';
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
      throw new MockServiceProviderTokenRevocationException(e);
    }
  }

  @Post(MockServiceProviderRoutes.USERINFO)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('login-callback')
  async retrieveUserinfo(@Res() res, @Body() body: AccessTokenParamsDTO) {
    try {
      /**
       * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'envIssuer';
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
      throw new MockServiceProviderUserinfoException(e);
    }
  }

  @Get(MockServiceProviderRoutes.ERROR)
  @Render('error')
  async error(@Query() query) {
    return {
      titleFront: "Mock service provider - Erreur lors de l'authentification",
      ...query,
    };
  }

  private async getInteractionParameters(provider: IdentityProviderMetadata) {
    const oidcClientConfig = this.config.get<OidcClientConfig>('OidcClient');
    const { scope, acr, claims } = oidcClientConfig;
    const { state, nonce } = await this.oidcClient.buildAuthorizeParameters();

    const authorizationUrl: string = await this.oidcClient.getAuthorizeUrl(
      state,
      scope,
      provider.uid,
      acr,
      nonce,
      claims,
    );

    const url = new URL(authorizationUrl);

    return {
      params: {
        // oidc name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        redirect_uri: provider.redirect_uris[0],
        // oidc name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        client_id: provider.client_id,
        uid: provider.uid,
        state,
        scope,
        acr,
        claims,
        nonce,
        // oidc name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        authorization_endpoint: `${url.origin}${url.pathname}`,
      },
      authorizationUrl,
    };
  }
}
