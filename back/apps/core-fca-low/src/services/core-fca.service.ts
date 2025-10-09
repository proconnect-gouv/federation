import { Request, Response } from 'express';
import { isEmpty } from 'lodash';
import { AuthorizationParameters } from 'openid-client';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig, UserSession } from '@fc/core/dto';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { LoggerService } from '@fc/logger';
import { IdentityProviderMetadata } from '@fc/oidc';
import { OidcAcrService } from '@fc/oidc-acr';
import { OidcClientConfig, OidcClientService } from '@fc/oidc-client';
import { OidcProviderService } from '@fc/oidc-provider';
import { SessionService } from '@fc/session';
import { TrackingService } from '@fc/tracking';
import { TrackedEvent } from '@fc/tracking/enums/tracked-event.enum';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
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
    private readonly tracking: TrackingService,
  ) {}
  // eslint-disable-next-line complexity
  async redirectToIdp(
    req: Request,
    res: Response,
    idpId: string,
  ): Promise<void> {
    const { spId, idpLoginHint, login_hint, spName, rememberMe } =
      this.session.get<UserSession>('User');
    const { scope } = this.config.get<OidcClientConfig>('OidcClient');

    await this.throwIfFqdnIsNotAuthorizedForSp(
      spId,
      idpLoginHint || login_hint,
    );

    const selectedIdp = await this.safelyGetExistingAndEnabledIdp(idpId);

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
      login_hint: idpLoginHint || login_hint,
      sp_id: spId,
      sp_name: spName,
      remember_me: rememberMe,
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

    await this.tracking.track(TrackedEvent.IDP_CHOSEN, { req });

    res.redirect(authorizationUrl);
  }

  hasDefaultIdp(providersUid: string[]): boolean {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;
    return providersUid.includes(defaultIdpId);
  }

  getSortedDisplayableIdentityProviders(
    identityProviders: IdentityProviderMetadata[],
  ): IdentityProviderMetadata[] {
    const defaultIdpId = this.config.get<AppConfig>('App').defaultIdpId;

    const filteredIdentityProviders = identityProviders.map(
      (identityProvider) => ({
        ...identityProvider,
        title:
          identityProvider.uid === defaultIdpId
            ? 'Autre'
            : identityProvider.title, // rename default IdP to "Autre"
      }),
    );

    // sort providers by title alphabetically with "Autre" at the end of the list
    return filteredIdentityProviders.sort((a, b) => {
      if (a.title === 'Autre') return 1;
      if (b.title === 'Autre') return -1;
      return a.title.localeCompare(b.title, 'fr');
    });
  }

  async selectIdpsFromEmail(
    email: string,
  ): Promise<IdentityProviderMetadata[]> {
    const fqdn = this.identityProvider.getFqdnFromEmail(email);
    const idpsFromFqdn = await this.identityProvider.getIdpsByFqdn(fqdn);

    // we get the part before the last @ to check if it's a "passe-droit" email
    const emailPrefix = email.substring(0, email.lastIndexOf('@'));

    const idpsWithRoutingEnabled = idpsFromFqdn.filter(
      (idp) => idp.isRoutingEnabled || emailPrefix.endsWith('+proconnect'),
    );

    // when there is no idp mapped for this fqdn
    // we check if there is or not a default idp set in the app
    // if yes, we return the default idp
    // if no, we return an empty config and we deduce that the default idp is not accepted
    if (idpsWithRoutingEnabled.length === 0) {
      const { defaultIdpId } = this.config.get<AppConfig>('App');

      if (!defaultIdpId) {
        return [];
      }

      return [await this.identityProvider.getById(defaultIdpId)];
    }

    return idpsWithRoutingEnabled;
  }

  /**
   * temporary code for resolving Uniforces issue
   */
  private throwIfFqdnIsNotAuthorizedForSp(
    spId: string,
    email: string,
  ): Promise<void> {
    const authorizedFqdnsConfig =
      this.fqdnService.getSpAuthorizedFqdnsDetails(spId);

    if (!authorizedFqdnsConfig?.authorizedFqdns.length) return;

    const fqdnFromEmail = this.identityProvider.getFqdnFromEmail(email);

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

  // check if the idp is allowed to authenticate the user with this email
  async isAllowedIdpForEmail(idpId: string, email: string): Promise<boolean> {
    const identityProvider = await this.identityProvider.getById(idpId);

    const emailFqdn = this.identityProvider.getFqdnFromEmail(email);

    if (identityProvider.fqdns?.some((fqdn) => fqdn === emailFqdn)) {
      return true;
    }

    // if no idp explicitly handles the domain, the only idp allowed is the default one
    const { defaultIdpId } = this.config.get<AppConfig>('App');
    return defaultIdpId === idpId;
  }

  private async safelyGetExistingAndEnabledIdp(
    idpId: string,
  ): Promise<IdentityProviderMetadata> {
    const idp = await this.identityProvider.getById(idpId);

    if (isEmpty(idp)) {
      throw new CoreFcaIdpConfigurationException();
    }

    if (!idp.active) {
      throw new CoreFcaAgentIdpDisabledException();
    }

    return idp;
  }
}
