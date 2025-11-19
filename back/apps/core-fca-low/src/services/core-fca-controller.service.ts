import { Request, Response } from 'express';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { Routes } from '@fc/core/enums';
import { CoreFcaAgentNoIdpException } from '@fc/core/exceptions';
import { CoreFcaService } from '@fc/core/services/core-fca.service';
import { EmailValidatorService } from '@fc/email-validator/services';
import { LoggerService, TrackedEvent } from '@fc/logger';
import { AcrClaims, OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';

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
    private readonly coreFcaService: CoreFcaService,
    private readonly emailValidatorService: EmailValidatorService,
    private readonly logger: LoggerService,
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

    const security = await this.oidcClient.utils.buildSecurityParameters();

    const { name: idpName, title: idpLabel } = selectedIdp;

    const sessionPayload: UserSession = {
      idpId,
      idpName,
      idpLabel,
      idpNonce: security.nonce,
      idpState: security.state,
      idpIdentity: undefined,
      spIdentity: undefined,
    };

    this.session.set('User', sessionPayload);

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const { acrValues, acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);

    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    const authorizeParams: AuthorizationParameters = this.authorizationParameters(security, scope, sessionPayload, acrClaims, acrValues, idpId, defaultIdpId);

    const authorizationUrl = await this.oidcClient.utils.getAuthorizeUrl(
      idpId,
      authorizeParams,
    );

    this.logger.track(TrackedEvent.IDP_CHOSEN);

    res.redirect(authorizationUrl);
  }

  authorizationParameters(safety : any, scope: string, sessionPayload: UserSession, acrClaims: AcrClaims, acrValues: string, idpId: string, defaultIdpId: string) {
    const { state, nonce } = safety;
    const { idpLoginHint, spId, spName, rememberMe } = sessionPayload;

    const authorizeParams: AuthorizationParameters = {
      state,
      nonce,
      scope,
      acr_values: null,
      claims: {
        id_token: {
          amr: null,
          acr: null,
        },
      },
      login_hint: idpLoginHint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
    };

    if (acrClaims) {
      authorizeParams['claims']['id_token']['acr'] = acrClaims;
    } else if (acrValues) {
      authorizeParams['acr_values'] = acrValues;
    }

    // these specific behaviors are legacy implementations and should be homogenized in the future
    if (idpId === defaultIdpId) {
      authorizeParams['scope'] += ' is_service_public';
    } else if (!acrValues && !acrClaims) {
      authorizeParams['acr_values'] = 'eidas1';
    }
    return authorizeParams;
  }
}
