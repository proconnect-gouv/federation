import { EidasAttributes, EidasRequest } from '@fc/eidas';
import { Injectable } from '@nestjs/common';
import {
  EidasToOidcAttributesMap,
  EidasToOidcLevelOfAssurancesMap,
} from '../mappers';

@Injectable()
export class EidasToOidcService {
  /**
   * Takes eIDAS requested attributes and level of assurance to return oidc
   * scope and acr_values
   *
   * @param requestedAttributes The eIDAS requested attributes
   * @param levelOfAssurance The eIDAS level requested for authentication
   * @return The oidc scope and acr_values
   */
  mapPartialRequest({
    requestedAttributes,
    levelOfAssurance,
  }: Partial<EidasRequest>) {
    const scopeSet = this.mapScopes(requestedAttributes);
    const scope = Array.from(scopeSet);

    return {
      // oidc claim
      // eslint-disable-next-line @typescript-eslint/naming-convention
      acr_values: EidasToOidcLevelOfAssurancesMap[levelOfAssurance],
      scope,
    };
  }

  /**
   * Takes eIDAS requested attributes to return oidc scope
   *
   * @param requestedAttributes The eIDAS requested attributes
   * @return a set of unique oidc scopes
   */
  private mapScopes(requestedAttributes: EidasAttributes[]): Set<string> {
    const scopesSet = new Set<string>();

    /**
     * Scope "openid" is always mandatory.
     * @see https://openid.net/specs/openid-connect-core-1_0.html#rfc.section.3.1.2.1
     */
    scopesSet.add('openid');

    return requestedAttributes.reduce(
      this.requestedAttributesReducer,
      scopesSet,
    );
  }

  /**
   * For each eIDAS requested attribute, add the corresponding scopes to a set
   *
   * @param scopeSet The scopes set containing the uniques oidc scopes
   * @param attribute the current eIDAS attribute
   * @return The scope set
   */
  private requestedAttributesReducer(
    scopeSet: Set<string>,
    attribute: EidasAttributes,
  ): Set<string> {
    EidasToOidcAttributesMap[attribute]?.forEach((elem) => {
      scopeSet.add(elem);
    });
    return scopeSet;
  }
}
