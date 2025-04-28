import { get, intersection, isArray, isEmpty, isString } from 'lodash';
import { UnknownObject } from 'oidc-provider';

import { Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { UserSession } from '@fc/core-fca';
import { OidcProviderConfig } from '@fc/oidc-provider';

export type SimplifiedInteraction = {
  uid: string;
  params: {
    acr_values: string;
    client_id: string;
    redirect_uri: string;
    state: string;
    idp_hint: string;
    login_hint: string;
  };
  prompt: {
    name: 'login' | 'consent' | string;
    reasons: string[];
    details:
      | {
          acr: {
            essential: boolean;
            value?: string;
            values?: string[];
          };
        }
      | UnknownObject;
  };
};

export type AcrValues = string;

export type AcrClaims = {
  essential: true;
  value?: string;
  values?: string[];
};

const DEFAULT_ACR_VALUE = 'eidas1';

@Injectable()
export class OidcAcrService {
  constructor(private readonly config: ConfigService) {}

  /**
   *  @returns the ACR for the current session, or undefined if the essential ACR requirement is not satisfied
   */
  getInteractionAcr({
    idpAcr,
    spEssentialAcr,
  }: Pick<UserSession, 'idpAcr' | 'spEssentialAcr'>): string | undefined {
    if (
      !isEmpty(spEssentialAcr) &&
      !spEssentialAcr.split(' ').includes(idpAcr)
    ) {
      return undefined;
    }

    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    if (!supportedAcrValues.includes(idpAcr)) {
      return DEFAULT_ACR_VALUE;
    }

    return idpAcr;
  }

  getFilteredAcrValues(
    requestedAcrValues: string[] | string | undefined,
  ): string[] {
    if (isEmpty(requestedAcrValues)) {
      return [];
    }

    let acrValuesAsArray: string[] = [];

    if (isString(requestedAcrValues)) {
      acrValuesAsArray = requestedAcrValues.split(' ');
    }

    if (isArray(requestedAcrValues)) {
      acrValuesAsArray = requestedAcrValues;
    }

    const {
      configuration: { acrValues: supportedAcrValues },
    } = this.config.get<OidcProviderConfig>('OidcProvider');

    return intersection(acrValuesAsArray, supportedAcrValues);
  }

  // eslint-disable-next-line complexity
  isEssentialAcrSatisfied({
    prompt,
  }: {
    prompt: SimplifiedInteraction['prompt'];
  }): boolean {
    if (prompt.name === 'login' && prompt.reasons.includes('essential_acr')) {
      return false;
    }

    if (prompt.name === 'login' && prompt.reasons.includes('essential_acrs')) {
      return false;
    }

    return true;
  }

  // eslint-disable-next-line complexity
  getFilteredAcrParamsFromInteraction({
    params,
    prompt,
  }: SimplifiedInteraction): { acrValues?: AcrValues; acrClaims?: AcrClaims } {
    if (prompt.name === 'login' && prompt.reasons.includes('essential_acr')) {
      return {
        acrClaims: {
          essential: true,
          value: this.getFilteredAcrValues(
            get(prompt.details, 'acr.value'),
          ).join(' '),
        },
      };
    }

    if (prompt.name === 'login' && prompt.reasons.includes('essential_acrs')) {
      return {
        acrClaims: {
          essential: true,
          values: this.getFilteredAcrValues(get(prompt.details, 'acr.values')),
        },
      };
    }

    if (isString(params?.acr_values)) {
      return {
        acrValues: this.getFilteredAcrValues(params.acr_values).join(' '),
      };
    }

    return { acrValues: DEFAULT_ACR_VALUE };
  }
}
