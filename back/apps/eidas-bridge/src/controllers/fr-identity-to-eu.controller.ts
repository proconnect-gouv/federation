import { Controller, Get, Redirect, Res, Req, Query } from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { AcrValues } from '@fc/oidc';
import { OidcClientService } from '@fc/oidc-client';
import { SessionService } from '@fc/session';
import { EidasProviderSession } from '@fc/eidas-provider';
import { IExposedSessionServiceGeneric, Session } from '@fc/session-generic';
import { EidasToOidcService, OidcToEidasService } from '@fc/eidas-oidc-mapper';
import { EidasBridgeRoutes } from '../enums';

/**
 * @todo Clean the controller (create a service, generalize code, ...)
 */
@Controller(EidasBridgeRoutes.BASE)
export class FrIdentityToEuController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly crypto: CryptographyService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly session: SessionService,
    private readonly eidasToOidc: EidasToOidcService,
    private readonly oidcToEidas: OidcToEidasService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  @Get(EidasBridgeRoutes.INIT_SESSION)
  @Redirect()
  async initSession(@Res() res) {
    const sessionIdLength = 32;
    const sessionId = this.crypto.genRandomString(sessionIdLength);

    await this.session.init(res, sessionId, { idpState: sessionId });

    return {
      url: `${EidasBridgeRoutes.BASE}${EidasBridgeRoutes.REDIRECT_TO_FC_AUTORIZE}`,
      statusCode: 302,
    };
  }

  /**
   * @TODO #251 ETQ Dev, j'utilise une configuration pour savoir si j'utilise FC, AC, EIDAS, et avoir les valeurs de scope et acr en config et non en dur.
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
   */
  @Get(EidasBridgeRoutes.REDIRECT_TO_FC_AUTORIZE)
  @Redirect()
  async redirectToFcAuthorize(
    @Req() req,
    @Session('EidasProvider')
    eidasProviderSession: IExposedSessionServiceGeneric<EidasProviderSession>,
  ) {
    const eidasRequest = await eidasProviderSession.get('eidasRequest');

    const oidcRequest = this.eidasToOidc.mapPartialRequest(eidasRequest);

    const { state, nonce } = await this.oidcClient.buildAuthorizeParameters();

    const authorizationUrl = await this.oidcClient.getAuthorizeUrl({
      state,
      scope: oidcRequest.scope.join(' '),
      providerUid: 'envIssuer',
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: oidcRequest.acr_values,
      nonce,
    });

    const sessionId = this.session.getId(req);
    await this.session.patch(sessionId, { idpState: state, idpNonce: nonce });

    return { url: authorizationUrl, statusCode: 302 };
  }

  @Get(EidasBridgeRoutes.REDIRECT_TO_EIDAS_RESPONSE_PROXY)
  @Redirect()
  async redirectToEidasResponseProxy(
    @Req() req,
    @Query() query,
    @Session('EidasProvider')
    eidasProviderSession: IExposedSessionServiceGeneric<EidasProviderSession>,
  ) {
    let partialEidasResponse;

    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { error, error_description } = query;
    if (error) {
      partialEidasResponse = this.oidcToEidas.mapPartialResponseFailure({
        error,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description,
      });
    } else {
      try {
        const providerUid = 'envIssuer';
        const sessionId = this.session.getId(req);

        const { idpState, idpNonce } = await this.session.get(sessionId);

        // OIDC: call idp's /token endpoint
        const tokenSet = await this.oidcClient.getTokenSet(
          req,
          providerUid,
          idpState,
          idpNonce,
        );

        const { acr } = tokenSet.claims();

        // openid defined property names
        // eslint-disable-next-line @typescript-eslint/naming-convention
        const { access_token: accessToken } = tokenSet;

        // OIDC: call idp's /userinfo endpoint
        const idpIdentity = await this.oidcClient.getUserInfo(
          accessToken,
          providerUid,
        );

        const { requestedAttributes } = await eidasProviderSession.get(
          'eidasRequest',
        );

        partialEidasResponse = this.oidcToEidas.mapPartialResponseSuccess(
          idpIdentity,
          /**
           * @todo Apply strong typing to acr values in other libs and apps
           */
          acr as AcrValues,
          requestedAttributes,
        );
      } catch (error) {
        partialEidasResponse = this.oidcToEidas.mapPartialResponseFailure(
          error,
        );
      }
    }

    await eidasProviderSession.set(
      'partialEidasResponse',
      partialEidasResponse,
    );

    return {
      url: '/eidas-provider/response-proxy',
      statusCode: 302,
    };
  }
}
