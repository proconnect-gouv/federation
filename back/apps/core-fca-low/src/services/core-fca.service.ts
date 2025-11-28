import { isEmpty } from 'lodash';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { AppConfig } from '@fc/core/dto';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { IdentityProviderMetadata } from '@fc/oidc';

import {
  CoreFcaAgentIdpDisabledException,
  CoreFcaIdpConfigurationException,
  CoreFcaUnauthorizedEmailException,
} from '../exceptions';

@Injectable()
export class CoreFcaService {
  constructor(
    private readonly config: ConfigService,
    private readonly identityProvider: IdentityProviderAdapterMongoService,
  ) {}

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
    const idpsFromFqdn = await this.identityProvider.getIdpsByEmail(email);

    // we get the part before the last @ to check if it's a "passe-droit" email
    const emailPrefix = email.substring(0, email.lastIndexOf('@'));

    const { passeDroitEmailSuffix } = this.config.get<AppConfig>('App');
    const idpsWithRoutingEnabled = idpsFromFqdn.filter(
      (idp) =>
        idp.isRoutingEnabled || emailPrefix.endsWith(passeDroitEmailSuffix),
    );

    // when there is no idp mapped for this fqdn
    // we check if there is or not a default idp set in the app
    // if yes, we return the default idp
    // if no, we return an empty config and we deduce that the default idp is not accepted
    if (isEmpty(idpsWithRoutingEnabled)) {
      const { defaultIdpId } = this.config.get<AppConfig>('App');

      if (!defaultIdpId) {
        return [];
      }

      return [await this.identityProvider.getById(defaultIdpId)];
    }

    return idpsWithRoutingEnabled;
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

  /**
   * Only policemen can connect to Uniforces.
   */
  ensureEmailIsAuthorizedForSp(spId: string, email: string): void {
    const fqdnFromEmail = this.identityProvider.getFqdnFromEmail(email);
    const { spAuthorizedFqdnsConfigs } = this.config.get<AppConfig>('App');

    const authorizedFqdnsConfig = spAuthorizedFqdnsConfigs.find((config) => {
      return config.spId === spId;
    });

    if (isEmpty(authorizedFqdnsConfig)) return;

    if (
      authorizedFqdnsConfig.authorizedFqdns.some(
        (fqdnInConfig) => fqdnInConfig === fqdnFromEmail,
      )
    ) {
      return;
    }

    throw new CoreFcaUnauthorizedEmailException(
      authorizedFqdnsConfig.spName,
      authorizedFqdnsConfig.spContact,
      authorizedFqdnsConfig.authorizedFqdns,
    );
  }

  async safelyGetExistingAndEnabledIdp(
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
