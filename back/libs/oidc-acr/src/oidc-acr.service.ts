import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { OidcSession } from '@fc/oidc';
import { OidcClientSession } from '@fc/oidc-client';

import { OidcAcrConfig } from './dto';

@Injectable()
export class OidcAcrService {
  constructor(private readonly config: ConfigService) {}

  getKnownAcrValues(): string[] {
    const { knownAcrValues } = this.config.get<OidcAcrConfig>('OidcAcr');

    return Object.keys(knownAcrValues);
  }

  /**
   * Acr level is high enough to respect provider requirements
   * @param input Acr given from the user
   * @param target Acr given from the Idp
   * @returns
   */
  isAcrValid(input: string, target: string): boolean {
    const { knownAcrValues } = this.config.get<OidcAcrConfig>('OidcAcr');

    return knownAcrValues[input] >= knownAcrValues[target];
  }

  getInteractionAcr(session: OidcSession): string {
    const { spAcr, idpAcr }: OidcClientSession = session;

    const { allowedAcrValues } = this.config.get<OidcAcrConfig>('OidcAcr');

    if (allowedAcrValues.includes(idpAcr)) {
      return idpAcr;
    }

    /**
     * We trust spAcr because:
     * 1. It has been validated as a valid acr value in the authorize step,
     * 2. We filtered out idp to be compatible with acr value required by sp.
     */
    return spAcr;
  }

  getAcrToAskToIdp(spAcr: string, idpAllowedAcr: string[]): string {
    const { knownAcrValues } = this.config.get<OidcAcrConfig>('OidcAcr');

    const idpMinAllowedAcr = this.getMinAcr(idpAllowedAcr);

    const acr =
      knownAcrValues[spAcr] > knownAcrValues[idpMinAllowedAcr]
        ? spAcr
        : idpMinAllowedAcr;

    return acr;
  }

  getMinAcr(acrList: string[]): string {
    const sorted = this.getSortedAcrList(acrList);

    const minAcr = sorted.shift();

    return minAcr;
  }

  getMaxAcr(acrList: string[]): string {
    const sorted = this.getSortedAcrList(acrList);

    const minAcr = sorted.pop();

    return minAcr;
  }

  private getSortedAcrList(acrList: string[]): string[] {
    const { knownAcrValues } = this.config.get<OidcAcrConfig>('OidcAcr');

    const sorted = Array.from(acrList).sort(
      (a, b) => knownAcrValues[a] - knownAcrValues[b],
    );

    return sorted;
  }
}
