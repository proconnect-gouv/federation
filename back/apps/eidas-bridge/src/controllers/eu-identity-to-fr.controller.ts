import {
  Controller,
  Get,
  Render,
  Redirect,
  Res,
  Req,
  UsePipes,
  ValidationPipe,
  Post,
  Body,
} from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { ConfigService } from '@fc/config';
import { IOidcIdentity, OidcError } from '@fc/oidc';
import { EidasToOidcService, OidcToEidasService } from '@fc/eidas-oidc-mapper';
import { IExposedSessionServiceGeneric, Session } from '@fc/session-generic';
import { EidasClientSession } from '@fc/eidas-client';
import { EidasBridgeRoutes } from '../enums';
import { ValidateEuropeanIdentity, Core } from '../dto';

/**
 * @todo Clean the controller (create a service, generalize code, ...)
 */
@Controller()
export class EuIdentityToFrController {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly logger: LoggerService,
    private readonly session: SessionService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcToEidas: OidcToEidasService,
    private readonly eidasToOidc: EidasToOidcService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * @TODO #291
   * modify interaction.ejs
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/271
   */
  @Get(EidasBridgeRoutes.INTERACTION)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Render('interaction')
  async getInteraction(
    @Req() req,
    @Res() res,
    @Session('EidasClient')
    session: IExposedSessionServiceGeneric<EidasClientSession>,
  ) {
    const { uid, params } = await this.oidcProvider.getInteraction(req, res);
    const { countryList } = await this.config.get<Core>('Core');
    const { interactionId } = req.fc;
    const { spName } = await this.session.get(interactionId);

    const eidasPartialRequest = this.oidcToEidas.mapPartialRequest(
      params.scope,
      params.acr_values,
    );

    await session.set('eidasPartialRequest', eidasPartialRequest);

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

  @Get(EidasBridgeRoutes.FINISH_FC_INTERACTION)
  async finishInteraction(
    @Req() req,
    @Res() res,
    @Session('EidasClient')
    session: IExposedSessionServiceGeneric<EidasClientSession>,
  ) {
    const { interactionId } = req.fc;

    const eidasResponse = await session.get('eidasResponse');

    if (eidasResponse.status.failure) {
      const { params } = await this.oidcProvider.getInteraction(req, res);

      const oidcError = await this.eidasToOidc.mapPartialResponseFailure(
        eidasResponse,
      );

      return res.redirect(this.buildRedirectUriErrorUrl(params, oidcError));
    }

    const {
      acr,
      userinfos: idpIdentity,
    } = await this.eidasToOidc.mapPartialResponseSuccess(eidasResponse);

    const spIdentity: IOidcIdentity = idpIdentity;

    // Delete idp identity from volatile memory but keep the sub for the business logs.
    const idpIdentityReset = { sub: idpIdentity.sub };

    // Store the changes in session
    await this.session.patch(interactionId, {
      // Save idp identity.
      idpIdentity: idpIdentityReset,
      // Save service provider identity.
      spIdentity,
      spAcr: acr,
    });

    return this.oidcProvider.finishInteraction(req, res);
  }

  private buildRedirectUriErrorUrl(params, oidcError: OidcError) {
    const { error, error_description: errorDescription } = oidcError;

    return `${params.redirect_uri}?error=${encodeURIComponent(
      error,
    )}&error_description=${encodeURIComponent(
      errorDescription,
    )}&state=${encodeURIComponent(params.state)}`;
  }
}
