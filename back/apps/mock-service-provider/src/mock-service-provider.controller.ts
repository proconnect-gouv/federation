import { encode } from 'querystring';
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
  Param,
} from '@nestjs/common';
import { IOidcIdentity, OidcSession } from '@fc/oidc';
import {
  OidcClientConfig,
  IdentityProviderMetadata,
  OidcClientRoutes,
  GetOidcCallback,
  OidcClientService,
  OidcClientSession,
} from '@fc/oidc-client';
import { LoggerService } from '@fc/logger';
import { ISessionGenericService, Session } from '@fc/session-generic';
import { CryptographyService } from '@fc/cryptography';
import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterEnvService } from '@fc/identity-provider-adapter-env';
import { AppConfig } from '@fc/app';
import { MockServiceProviderRoutes } from './enums';
import {
  MockServiceProviderTokenRevocationException,
  MockServiceProviderUserinfoException,
} from './exceptions';
import { AccessTokenParamsDTO } from './dto';

@Controller()
export class MockServiceProviderController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly logger: LoggerService,
    private readonly crypto: CryptographyService,
    private readonly identityProvider: IdentityProviderAdapterEnvService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get()
  @Render('index')
  async index(
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const { defaultAcrValue } = this.config.get('App');

    // Only one provider is available with `@fc/identity-provider-env`
    const [provider] = await this.identityProvider.getList();

    const { authorizationUrl, params } = await this.getInteractionParameters(
      provider,
    );

    const sessionIdLength = 32;
    const sessionId: string = this.crypto.genRandomString(sessionIdLength);

    await sessionOidc.set({
      sessionId,
      idpState: params.state,
      idpNonce: params.nonce,
    });

    return {
      titleFront: 'Mock Service Provider',
      params,
      authorizationUrl: authorizationUrl,
      defaultAcrValue,
    };
  }

  @Get('/interaction/:uid/verify')
  @Render('login-callback')
  async getVerify(
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    const session = await sessionOidc.get();

    return {
      ...session,
      accessToken: session.idpAccessToken,
      titleFront: 'Mock Service Provider - Login Callback',
    };
  }

  @Get(MockServiceProviderRoutes.LOGOUT)
  async logout(
    @Res() res,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */ @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
    @Query('post_logout_redirect_uri')
    postLogoutRedirectUri?: string,
  ) {
    const { idpIdToken, idpState, idpId } = await sessionOidc.get();

    const endSessionUrl = await this.oidcClient.getEndSessionUrlFromProvider(
      idpId,
      idpState,
      idpIdToken,
      postLogoutRedirectUri,
    );

    res.redirect(endSessionUrl);
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
  async revocationToken(
    @Res()
    res,
    @Body()
    body: AccessTokenParamsDTO,
  ) {
    try {
      /**
       * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
       * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
       */
      const providerUid = 'envIssuer';
      const { accessToken } = body;
      await this.oidcClient.utils.revokeToken(accessToken, providerUid);

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

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */
  // needed for controller
  // eslint-disable-next-line max-params
  @Get(OidcClientRoutes.OIDC_CALLBACK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getOidcCallback(
    @Req() req,
    @Res() res,
    @Query() query,
    @Param() params: GetOidcCallback,
    /**
     * @todo Adaptation for now, correspond to the oidc-provider side.
     * Named "OidcClient" because we need a future shared session between our libs oidc-provider and oidc-client
     * without a direct dependance like now.
     * @author Hugues
     * @date 2021-04-16
     * @ticket FC-xxx
     */
    @Session('OidcClient')
    sessionOidc: ISessionGenericService<OidcClientSession>,
  ) {
    /**
     * @todo Adaptation for now, we should probably find a better way to handle
     * errors on the oidc callback on the mock.
     * @Todo Since nodev16 should use the <URLSearchParams> API instead of querystring.encode
     *
     * @author Stéphane/Matthieu
     * @date 2021-05-12
     * @ticket FC-xxx
     */
    if (query.error) {
      const errorUri = `/error?${encode(query)}`;

      return res.redirect(errorUri);
    }

    const { providerUid } = params;
    const { interactionId, idpState, idpNonce } = await sessionOidc.get();

    const tokenParams = {
      providerUid,
      idpState,
      idpNonce,
    };
    const {
      accessToken,
      idToken,
      acr,
      amr,
    } = await this.oidcClient.getTokenFromProvider(tokenParams, req);

    const userInfoParams = {
      accessToken,
      providerUid,
    };

    const identity: IOidcIdentity = await this.oidcClient.getUserInfosFromProvider(
      userInfoParams,
      req,
    );

    /**
     *  @todo
     *    author: Arnaud
     *    date: 19/03/2020
     *    ticket: FC-244 (identity, DTO, Mock, FS)
     *
     *    action: Check the data returns from FC
     */
    const identityExchange: OidcSession = {
      idpIdentity: identity,
      idpAcr: acr,
      amr,
      idpAccessToken: accessToken,
      idpIdToken: idToken,
    };

    await sessionOidc.set({ ...identityExchange });

    // BUSINESS: Redirect to business page
    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${interactionId}/verify`);
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
      const idpIdentity = await this.oidcClient.utils.getUserInfo(
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
    const {
      state,
      nonce,
    } = await this.oidcClient.utils.buildAuthorizeParameters();

    const authorizationUrl: string = await this.oidcClient.utils.getAuthorizeUrl(
      {
        state,
        scope,
        providerUid: provider.uid,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        acr_values: acr,
        nonce,
        claims,
      },
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
