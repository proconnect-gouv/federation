import {
  Controller,
  Get,
  Render,
  Redirect,
  Res,
  Req,
  Query,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
} from '@nestjs/common';
import { CryptographyService } from '@fc/cryptography';
import { LoggerService } from '@fc/logger';
import { AcrValues } from '@fc/oidc';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { EidasProviderSession } from '@fc/eidas-provider';
import { IExposedSessionServiceGeneric, Session } from '@fc/session-generic';
import { EidasToOidcService, OidcToEidasService } from '@fc/eidas-oidc-mapper';
import { EidasBridgeRoutes } from '../enums';
import { ValidateEuropeanIdentity, Core } from '../dto';

/**
 * @todo Clean the controller (create a service, generalize code, ...)
 */
@Controller(EidasBridgeRoutes.BASE)
export class EidasBridgeController {
  constructor(
    private readonly crypto: CryptographyService,
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly oidcClient: OidcClientService,
    private readonly session: SessionService,
    private readonly oidcProvider: OidcProviderService,
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

  /* @TODO #251
   * ETQ Dev, j'utilise une variable d'env pour savoir si j'utilise FC, AC, EIDAS
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/251
   *
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

    const params = {
      providerUid: 'corev2',
      scope: oidcRequest.scope.join(' '),
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: oidcRequest.acr_values,
    };
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    const {
      state,
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
      partialEidasResponse = this.oidcToEidas.mapFailurePartialResponse({
        error,
        // oidc param name
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description,
      });
    } else {
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

        partialEidasResponse = this.oidcToEidas.mapSuccessPartialResponse(
          idpIdentity,
          /**
           * @todo Apply strong typing to acr values in other libs and apps
           */
          acr as AcrValues,
          requestedAttributes,
        );
      } catch (error) {
        partialEidasResponse = this.oidcToEidas.mapFailurePartialResponse(
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

  /**
   * @TODO #291
   * modify interaction.ejs
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/271
   */
  @Get(EidasBridgeRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(@Req() req, @Res() res) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const { countryList } = await this.config.get<Core>('Core');
    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);
    return {
      countryList,
      uid,
      params,
      spName,
    };
  }

  /**
   * @todo ajouter une interface sur l'identité au format oidc
   */
  @Post(EidasBridgeRoutes.INTERACTION_LOGIN)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Redirect()
  async redirectToFrNodeConnector(@Body() body: ValidateEuropeanIdentity) {
    return {
      url: `/eidas-client/redirect-to-fr-node-connector?country=${body.country}`,
      statusCode: 302,
    };
  }
}
