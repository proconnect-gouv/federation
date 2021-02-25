import {
  Controller,
  Get,
  Param,
  Req,
  Res,
  Body,
  Post,
  Inject,
  ValidationPipe,
  UsePipes,
} from '@nestjs/common';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { AppConfig } from '@fc/app';
import { ConfigService } from '@fc/config';
import { IServiceProviderService } from '@fc/oidc-provider';
import { IDENTITY_PROVIDER_SERVICE, SERVICE_PROVIDER_SERVICE } from './tokens';
import { IIdentityProviderService } from './interfaces';
import { OidcClientTokenEvent, OidcClientUserinfoEvent } from './events';
import { RedirectToIdp, GetOidcCallback } from './dto';
import { OidcClientRoutes } from './enums';
import { OidcClientService } from './services';
import {
  OidcClientIdpBlacklistedException,
  OidcClientFailedToFetchBlacklist,
} from './exceptions';

@Controller()
export class OidcClientController {
  constructor(
    private readonly oidcClient: OidcClientService,
    private readonly session: SessionService,
    @Inject(IDENTITY_PROVIDER_SERVICE)
    private readonly identityProvider: IIdentityProviderService,
    @Inject(SERVICE_PROVIDER_SERVICE)
    private readonly serviceProvider: IServiceProviderService,
    private readonly tracking: TrackingService,
    private readonly config: ConfigService,
  ) {}

  /**
   * Method to check if
   * an identity provider is blacklisted or whitelisted
   * @param spId service provider ID
   * @param idpId identity provider ID
   * @returns {boolean}
   */
  private async checkIdpBlacklisted(
    spId: string,
    idpId: string,
  ): Promise<boolean> {
    let isIdpExcluded = false;
    try {
      isIdpExcluded = await this.serviceProvider.shouldExcludeIdp(spId, idpId);
    } catch (error) {
      throw new OidcClientFailedToFetchBlacklist(error);
    }

    if (isIdpExcluded) {
      throw new OidcClientIdpBlacklistedException(spId, idpId);
    }
    return isIdpExcluded;
  }

  /**
   * @todo #242 get configured parameters (scope and acr)
   */
  @Post(OidcClientRoutes.REDIRECT_TO_IDP)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async redirectToIdp(
    @Res() res,
    @Req() req,
    @Body() body: RedirectToIdp,
  ): Promise<void> {
    const {
      scope,
      claims,
      providerUid,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
    } = body;

    /**
     * @TODO This controller should not be generic
     * This is a specific behaviour for FC and not for fsp*v2
     */
    let serviceProviderId: string | null;
    const { interactionId } = req.fc;
    try {
      const { spId } = await this.session.get(interactionId);
      serviceProviderId = spId;
    } catch (error) {
      serviceProviderId = null;
    }
    if (serviceProviderId) {
      await this.checkIdpBlacklisted(serviceProviderId, providerUid);
    }

    // TODO END

    const { state, nonce } = await this.oidcClient.buildAuthorizeParameters();

    const authorizationUrl = await this.oidcClient.getAuthorizeUrl(
      state,
      scope,
      providerUid,
      // acr_values is an oidc defined variable name
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values,
      nonce,
      claims,
    );

    const { name: idpName } = await this.identityProvider.getById(providerUid);

    await this.session.patch(req.fc.interactionId, {
      idpId: providerUid,
      idpName,
      idpState: state,
      idpNonce: nonce,
    });

    res.redirect(authorizationUrl);
  }

  /**
   * @TODO #308 ETQ DEV je veux éviter que deux appels Http soient réalisés au lieu d'un à la discovery Url dans le cadre d'oidc client
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/308
   */
  @Get(OidcClientRoutes.OIDC_CALLBACK)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getOidcCallback(
    @Req() req,
    @Res() res,
    @Param() params: GetOidcCallback,
  ) {
    const { providerUid } = params;
    /**
     * @TODO This service provider should not be generic, When it's called with FC
     * we have the spId in session but not when it's called with a service provder
     */
    let serviceProviderId: string | null;
    try {
      const { interactionId } = req.fc;
      const { spId } = await this.session.get(interactionId);
      serviceProviderId = spId;
    } catch (error) {
      serviceProviderId = null;
    }
    if (serviceProviderId) {
      await this.checkIdpBlacklisted(serviceProviderId, providerUid);
    }
    // TODO END

    const uid = req.fc.interactionId;
    const { idpState, idpNonce } = await this.session.get(uid);

    // OIDC: call idp's /token endpoint
    const tokenSet = await this.oidcClient.getTokenSet(
      req,
      providerUid,
      idpState,
      idpNonce,
    );
    // openid defined property names
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { access_token: accessToken } = tokenSet;
    this.tracking.track(OidcClientTokenEvent, req);

    // OIDC: call idp's /userinfo endpoint
    const idpIdentity = await this.oidcClient.getUserInfo(
      accessToken,
      providerUid,
    );
    this.tracking.track(OidcClientUserinfoEvent, req);

    // BUSINESS: Locally store received identity
    const { acr, amr } = tokenSet.claims();

    this.session.patch(uid, {
      idpIdentity,
      idpAcr: acr,
      amr,
      idpAccessToken: accessToken,
    });

    // BUSINESS: Redirect to business page
    const { urlPrefix } = this.config.get<AppConfig>('App');
    res.redirect(`${urlPrefix}/interaction/${uid}/verify`);
  }

  /**
   * @TODO #141 implement proper well-known
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/141
   *  - generated by openid-client
   *  - pub keys orverrided by keys from HSM
   */
  @Get(OidcClientRoutes.WELL_KNOWN_KEYS)
  async getWellKnownKeys() {
    return this.oidcClient.wellKnownKeys();
  }
}
