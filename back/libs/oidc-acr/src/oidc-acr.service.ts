import { intersection } from 'lodash';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core-fca';
import { OidcProviderConfig } from '@fc/oidc-provider';

@Injectable()
export class OidcAcrService {
  constructor(private readonly config: ConfigService) {}
  getInteractionAcr(session: UserSession): string {
    const { idpAcr } = session;

    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    return supportedAcrValues.includes(idpAcr) ? idpAcr : 'eidas1';
  }

  getFilteredAcrValues(requestedAcrValues: string | undefined): string {
    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    return intersection(
      requestedAcrValues?.split(' '),
      supportedAcrValues,
    ).join(' ');
  }
}
