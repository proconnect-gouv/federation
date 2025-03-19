import { Response } from 'express';

import { Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { CORE_AUTH_SERVICE, CoreAuthorizationService } from '@fc/core';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import {
  OidcClientConfig,
  OidcClientIdpDisabledException,
  OidcClientService,
} from '@fc/oidc-client';
import { Session, SessionService } from '@fc/session';

import { CoreFcaAgentIdpDisabledException } from '../exceptions';
import { CoreFcaUnauthorizedEmailException } from '../exceptions/core-fca-unauthorized-email-exception';
import {
  CoreFcaAuthorizationParametersInterface,
  CoreFcaServiceInterface,
} from '../interfaces';
import { CoreFcaFqdnService } from './core-fca-fqdn.service';

@Injectable()
export class CoreFcaService implements CoreFcaServiceInterface {
  // Dependency injection can require more than 4 parameters
  /* eslint-disable-next-line max-params */
  constructor(
    private readonly config: ConfigService,
    private readonly oidcClient: OidcClientService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
    @Inject(CORE_AUTH_SERVICE)
    private readonly coreAuthorization: CoreAuthorizationService,
    private readonly session: SessionService,
    private readonly fqdnService: CoreFcaFqdnService,
    private readonly logger: LoggerService,
  ) {}
  async redirectToIdp(
    res: Response,
    idpId: string,
    {
      acr_values,
      login_hint,
      claims = {
        id_token: {
          amr: {
            essential: true,
          },
          acr: {
            essential: true,
          },
        },
      },
    }: Pick<
      CoreFcaAuthorizationParametersInterface,
      'acr_values' | 'login_hint' | 'claims'
    >,
  ): Promise<void> {
    const { spId } = this.session.get<Session>('OidcClient');

    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    await this.validateEmailForSp(spId, login_hint);
    await this.checkIdpDisabled(idpId);

    const { nonce, state } =
      await this.oidcClient.utils.buildAuthorizeParameters();

    const authorizeParams: CoreFcaAuthorizationParametersInterface = {
      state,
      scope,
      acr_values,
      nonce,
      sp_id: spId,
      login_hint,
      claims,
    };

    const authorizationUrl = await this.coreAuthorization.getAuthorizeUrl(
      idpId,
      authorizeParams,
    );

    const { name: idpName, title: idpLabel } =
      await this.identityProvider.getById(idpId);
    const sessionPayload: Session = {
      idpId,
      idpName,
      idpLabel,
      idpNonce: nonce,
      idpState: state,
      idpIdentity: undefined,
      spIdentity: undefined,
      accountId: undefined,
    };

    this.session.set('OidcClient', sessionPayload);

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
