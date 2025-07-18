import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core-fca/dto';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { OidcAcrService } from '@fc/oidc-acr';
import {
  OidcClientConfig,
  OidcClientIdpDisabledException,
  OidcClientService,
} from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaUnauthorizedEmailException,
} from '../exceptions';
import { CoreFcaFqdnService } from './core-fca-fqdn.service';

@Injectable()
export class CoreFcaService {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly oidcProvider: OidcProviderService,
    private readonly oidcAcr: OidcAcrService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    private readonly session: SessionService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly logger: LoggerService,
  ) {}
  // eslint-disable-next-line complexity
  async redirectToIdp(
    req: Request,
    res: Response,
    idpId: string,
  ): Promise<void> {
    const { spId, login_hint } = this.session.get<UserSession>('User');
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    await this.validateEmailForSp(spId, login_hint);

    const selectedIdp = await this.identityProvider.getById(idpId);

    if (isEmpty(selectedIdp)) {
      throw new Error(`Idp ${idpId} not found`);
    }

    await this.checkIdpDisabled(idpId);

    const { nonce, state } =
      await this.oidcClient.utils.buildAuthorizeParameters();

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
      login_hint,
      sp_id: spId,
    };

    const interaction = await this.oidcProvider.getInteraction(req, res);
    const { acrValues, acrClaims } =
      this.oidcAcr.getFilteredAcrParamsFromInteraction(interaction);

    if (acrClaims) {
      authorizeParams['claims']['id_token']['acr'] = acrClaims;
    } else if (acrValues) {
      authorizeParams['acr_values'] = acrValues;
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

    res.redirect(authorizationUrl);
  }

  /**
   * temporary code for resolving Uniforces issue
   * we check if the email is authorized to access the idp for the sp
   */
  private async validateEmailForSp(spId: string, email: string): Promise<void> {
    const authorizedFqdnsConfig =
      this.fqdnService.getSpAuthorizedFqdnsConfig(spId);

    if (!authorizedFqdnsConfig?.authorizedFqdns.length) return;

    const { fqdn: fqdnFromEmail } =
      await this.fqdnService.getFqdnConfigFromEmail(email);

    if (
      !authorizedFqdnsConfig.authorizedFqdns.some(
        (fqdnInConfig) => fqdnInConfig === fqdnFromEmail,
      )
    ) {
      this.logger.err(`Unauthorized fqdn ${fqdnFromEmail} for SP ${spId}`);
      throw new CoreFcaUnauthorizedEmailException(
        authorizedFqdnsConfig.spName,
        authorizedFqdnsConfig.spContact,
        authorizedFqdnsConfig.authorizedFqdns,
      );
    }
  }

  private async checkIdpDisabled(idpId: string) {
    try {
      await this.oidcClient.utils.checkIdpDisabled(idpId);
    } catch (error) {
      if (error instanceof OidcClientIdpDisabledException) {
        throw new CoreFcaAgentIdpDisabledException();
      }
      throw error;
    }
  }

  async getIdentityProvidersByIds(idpIds: string[]) {
    const idpList = await this.identityProvider.getList();
    return idpList
      .filter(({ uid }) => idpIds.includes(uid))
      .map(({ name, title, uid }) => ({ name, title, uid }));
  }
}
