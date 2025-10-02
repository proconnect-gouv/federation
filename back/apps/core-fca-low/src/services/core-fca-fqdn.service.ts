import { uniq } from 'lodash';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { FqdnToIdpAdapterMongoService } from '@fc/fqdn-to-idp-adapter-mongo';

import { AppConfig } from '../dto';
import { FqdnConfigInterface } from '../interfaces';

@Injectable()
export class CoreFcaFqdnService {
  constructor(
    private readonly fqdnToIdpAdapterMongo: FqdnToIdpAdapterMongoService,
    private readonly config: ConfigService,
  ) {}
  async getFqdnConfigFromEmail(email: string): Promise<FqdnConfigInterface> {
    const { defaultIdpId } = this.config.get<AppConfig>('App');
    const fqdn = this.getFqdnFromEmail(email);
    const idpsByFqdn = await this.fqdnToIdpAdapterMongo.getIdpsByFqdn(fqdn);

    // when there is no idp mapped for this fqdn
    // we check if there is or not a default idp set in the app
    // if yes, we return the default idp
    // if no, we return an empty config and we deduce that the default idp is not accepted
    if (idpsByFqdn.length === 0) {
      return {
        fqdn,
        identityProviderIds: defaultIdpId ? [defaultIdpId] : [],
      };
    }

    const uniqueDuplicateFreeIdpUids = uniq(
      idpsByFqdn.map(({ identityProvider }) => identityProvider),
    );

    return {
      fqdn,
      identityProviderIds: uniqueDuplicateFreeIdpUids,
    };
  }

  getFqdnFromEmail(email: string | undefined): string | undefined {
    return email?.split('@').pop().toLowerCase();
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
    const existingFqdnToProvider =
      await this.fqdnToIdpAdapterMongo.fetchFqdnToIdpByEmail(email);

    if (existingFqdnToProvider.length > 0) {
      return existingFqdnToProvider.some(
        ({ identityProvider }) => identityProvider === idpId,
      );
    }

    // if fqdnToProvider not exists, the only idp allowed is the default one
    const { defaultIdpId } = this.config.get<AppConfig>('App');
    return defaultIdpId === idpId;
  }
}
