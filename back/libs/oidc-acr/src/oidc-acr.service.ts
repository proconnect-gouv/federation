import { intersection } from 'lodash';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { OidcSession } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';
import { OidcProviderConfig } from '@fc/oidc-provider';

@Injectable()
export class OidcAcrService {
  constructor(private readonly config: ConfigService) {}
  getInteractionAcr(session: OidcSession): string {
    const { idpAcr }: OidcClientSession = session;

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
