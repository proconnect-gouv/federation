import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { IdentityProviderAdapterMongoService } from '@fc/identity-provider-adapter-mongo';
import { IdentityProviderMetadata } from '@fc/oidc';

import { AppConfig } from '../dto';

@Injectable()
export class CoreFcaFqdnService {
  constructor(
    private readonly identityProviderAdapterMongoService: IdentityProviderAdapterMongoService,
    private readonly config: ConfigService,
  ) {}
  async getIdpsFromEmail(email: string): Promise<IdentityProviderMetadata[]> {
    const fqdn =
      this.identityProviderAdapterMongoService.getFqdnFromEmail(email);
    const idpsFromFqdn =
      await this.identityProviderAdapterMongoService.getIdpsByFqdn(fqdn);

    // when there is no idp mapped for this fqdn
    // we check if there is or not a default idp set in the app
    // if yes, we return the default idp
    // if no, we return an empty config and we deduce that the default idp is not accepted
    if (idpsFromFqdn.length === 0) {
      const { defaultIdpId } = this.config.get<AppConfig>('App');

      if (!defaultIdpId) {
        return [];
      }

      return [
        await this.identityProviderAdapterMongoService.getById(defaultIdpId),
      ];
    }

    return idpsFromFqdn;
  }

  getSpAuthorizedFqdnsConfig(spId: string): {
    spName: string;
    spContact: string;
    authorizedFqdns: string[];
  } | null {
    const { spAuthorizedFqdnsConfigs } = this.config.get<AppConfig>('App');

    return (
      spAuthorizedFqdnsConfigs.find((config) => {
        return config.spId === spId;
      }) || null
    );
  }

  async isAllowedIdpForEmail(idpId: string, email: string): Promise<boolean> {
    const identityProvider =
      await this.identityProviderAdapterMongoService.getById(idpId);

    const emailFqdn =
      this.identityProviderAdapterMongoService.getFqdnFromEmail(email);

    if (identityProvider.fqdns?.some((fqdn) => fqdn === emailFqdn)) {
      return true;
    }

    // if no idp explicitly handles the domain, the only idp allowed is the default one
    const { defaultIdpId } = this.config.get<AppConfig>('App');
    return defaultIdpId === idpId;
  }
}
