import { Request, Response } from 'express';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { Routes } from '@fc/core/enums';
import { CoreFcaAgentNoIdpException } from '@fc/core/exceptions';
import { CoreFcaService } from '@fc/core/services/core-fca.service';
import { EmailValidatorService } from '@fc/email-validator/services';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService, OidcClientIssuerService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { TrackedEvent } from '@fc/tracking/enums';

@Injectable()
export class CoreFcaControllerService {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly session: SessionService,
    private readonly tracking: TrackingService,
    private readonly coreFcaService: CoreFcaService,
    private readonly emailValidatorService: EmailValidatorService,
    private readonly issuer: OidcClientIssuerService,
  ) {}

  async redirectToIdpWithEmail(
    req: Request,
    res: Response,
    email: string,
    rememberMe: boolean,
  ): Promise<void> {
    this.session.set('User', { rememberMe: rememberMe, idpLoginHint: email });

    // TODO(douglasduteil): temporary solution to avoid blocking the user
    // We are testing the email validity without breaking the flow here
    await this.emailValidatorService.validate(email);

    const idpsFromEmail = await this.coreFcaService.selectIdpsFromEmail(email);

    if (idpsFromEmail.length === 0) {
      const { spName } = this.session.get<UserSession>('User');

      throw new CoreFcaAgentNoIdpException(spName, email);
    }

    if (idpsFromEmail.length > 1) {
      const { urlPrefix } = this.config.get<AppConfig>('App');
      const url = `${urlPrefix}${Routes.IDENTITY_PROVIDER_SELECTION}`;

      return res.redirect(url);
    }

    return this.redirectToIdpWithIdpId(req, res, idpsFromEmail[0].uid);
  }

  // eslint-disable-next-line complexity
  async redirectToIdpWithIdpId(
    req: Request,
    res: Response,
    idpId: string,
  ): Promise<void> {
    const { spId, idpLoginHint, spName, rememberMe } =
      this.session.get<UserSession>('User');
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    this.coreFcaService.ensureEmailIsAuthorizedForSp(spId, idpLoginHint);

    const selectedIdp =
      await this.coreFcaService.safelyGetExistingAndEnabledIdp(idpId);

    const client = await this.issuer.getClient(idpId);
    const scopes_supported = client.issuer.scopes_supported as string[];
    const pc_scopes = scope.split(" ");
    const request_scopes = pc_scopes.filter(s => scopes_supported.includes(s));

    const claims_param = client.issuer.claims_parameter_supported as boolean;

    const { nonce, state } =
      await this.oidcClient.utils.buildAuthorizeParameters();

    const authorizeParams: AuthorizationParameters = {
      state,
      nonce,
      scope: request_scopes.join(" "),
      acr_values: null,
      login_hint: idpLoginHint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
    };
    const claims = {
      id_token: {
        amr: null,
        acr: null,
      },
    };

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const { acrValues, acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);

    if (acrClaims) {
      claims['id_token']['acr'] = acrClaims;
    } else if (acrValues) {
      authorizeParams['acr_values'] = acrValues;
    }

    if (claims_param) {
      authorizeParams.claims = claims;
    }

    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    // these specific behaviors are legacy implementations and should be homogenized in the future
    if (idpId === defaultIdpId) {
      authorizeParams['scope'] += ' is_service_public';
    } else if (!acrValues && !acrClaims) {
      authorizeParams['acr_values'] = 'eidas1';
    }

    const authorizationUrl = await this.oidcClient.utils.getAuthorizeUrl(
      idpId,
      authorizeParams,
    );

    const { name: idpName, title: idpLabel } = selectedIdp;

    const sessionPayload: UserSession = {
      idpId,
      idpName,
      idpLabel,
      idpNonce: nonce,
      idpState: state,
      idpIdentity: undefined,
      spIdentity: undefined,
    };

    this.session.set('User', sessionPayload);

    await this.tracking.track(TrackedEvent.IDP_CHOSEN, { req });

    res.redirect(authorizationUrl);
  }
}
