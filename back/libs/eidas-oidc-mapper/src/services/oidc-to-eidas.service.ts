import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { OidcError, AcrValues } from '@fc/oidc';
import {
  EidasAttributes,
  EidasPartialRequest,
  EidasResponse,
  EidasResponseAttributes,
  EidasStatusCodes,
  EidasSubStatusCodes,
} from '@fc/eidas';
import { LoggerService } from '@fc/logger';
import {
  ScopesToRequestedAttributesMap,
  AcrValuesToLevelOfAssurancesMap,
  ClaimsToAttributesMap,
} from '../mappers';
import { IOidcIdentity } from '../interfaces';

@Injectable()
export class OidcToEidasService {
  constructor(private readonly logger: LoggerService) {
    logger.setContext(this.constructor.name);
  }

  mapPartialRequest(
    requestedScopes: string,
    acr: AcrValues,
  ): EidasPartialRequest {
    const requestedAttributesSet: Set<EidasAttributes> = this.mapScopesToRequestedAttributes(
      requestedScopes.split(' '),
    );
    const requestedAttributes = Array.from(requestedAttributesSet);

    return {
      levelOfAssurance: AcrValuesToLevelOfAssurancesMap[acr],
      requestedAttributes,
    };
  }

  /**
   * Takes oidc claims and acr and return the corresponding eIDAS fields
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @param acr The eIDAS level used for authentication
   * @param requestedAttributes The eIDAS requested attributes
   * @return A partial eidas response
   */
  mapPartialResponseSuccess(
    claims: Partial<IOidcIdentity>,
    acr: AcrValues,
    requestedAttributes: EidasAttributes[],
  ): Partial<EidasResponse> {
    const attributes = this.mapRequestedAttributesFromClaims(
      claims,
      requestedAttributes,
    );

    return {
      subject: claims.sub,
      levelOfAssurance: AcrValuesToLevelOfAssurancesMap[acr],
      status: {
        failure: false,
        statusCode: EidasStatusCodes.SUCCESS,
      },
      attributes,
    };
  }

  /**
   * Takes the error from the oidc cinematic and return an eIDAS response
   *
   * @param error An oidc error or an instance of error
   * @return A partial eidas response contaning only the status
   */
  mapPartialResponseFailure(error: Error | OidcError): Partial<EidasResponse> {
    let errorToReturn: OidcError;

    /**
     * @todo An amelioration would be possible
     * Temporary way to send a structured error to the node
     * Actually, this function can receive an Error instance but should only recieved an oidc one.
     */
    if (error instanceof Error) {
      errorToReturn = {
        error: 'internal_error',
        // oidc parameter
        // eslint-disable-next-line @typescript-eslint/naming-convention
        error_description:
          'FranceConnect encountered an unexpected error, please contact the support (Code Y000000).',
      };
      this.logger.error(error);
    } else {
      errorToReturn = error;
    }

    return {
      status: {
        failure: true,
        statusCode: EidasStatusCodes.RESPONDER,
        subStatusCode: EidasSubStatusCodes.AUTHN_FAILED,
        statusMessage: `[${errorToReturn.error}]: ${errorToReturn.error_description}`,
      },
    };
  }

  /**
   * Takes oidc claims and acr and return the corresponding eIDAS attributes
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @param requestedAttributes The eIDAS requested attributes
   * @return The eidas response attributes
   */
  private mapRequestedAttributesFromClaims(
    claims: Partial<IOidcIdentity>,
    requestedAttributes: EidasAttributes[],
  ): EidasResponseAttributes {
    return requestedAttributes.reduce(
      this.getClaimsBoundedClaimsToAttributesReducer(claims),
      {},
    );
  }

  /**
   * Bind the claims to the claimsToAttributesReducer
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @return The claimsToAttributesReducer with bounded claims
   */
  private getClaimsBoundedClaimsToAttributesReducer(
    claims: Partial<IOidcIdentity>,
  ) {
    return this.claimsToAttributesReducer.bind(OidcToEidasService, claims);
  }

  /**
   * Takes oidc claims and acr and return the corresponding eIDAS attributes
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @param attributes The object containing the eIDAS response attributes
   * @param requestedAttributes The eIDAS requested attributes
   * @return The eidas response attributes
   */
  private claimsToAttributesReducer(
    claims: Partial<IOidcIdentity>,
    attributes: EidasResponseAttributes,
    requestedAttribute: EidasAttributes,
  ) {
    if (ClaimsToAttributesMap[requestedAttribute]) {
      attributes[requestedAttribute] = ClaimsToAttributesMap[
        requestedAttribute
      ](claims);
    }

    return attributes;
  }

  /**
   * Takes oidc scopes to return eIDAS requested attributes
   *
   * @param oidcScopes The oidc scopes
   * @return a set of unique eIDAS requested attributes
   */
  private mapScopesToRequestedAttributes(
    oidcScopes: string[],
  ): Set<EidasAttributes> {
    /**
     * Theses attributes are always mandatory.
     * @see https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS+eID+Profile?preview=/82773108/148898847/eIDAS%20SAML%20Attribute%20Profile%20v1.2%20Final.pdf
     * Section 2.2.1
     */
    const scopesSet = new Set<EidasAttributes>([
      EidasAttributes.PERSON_IDENTIFIER,
      EidasAttributes.CURRENT_GIVEN_NAME,
      EidasAttributes.CURRENT_FAMILY_NAME,
      EidasAttributes.DATE_OF_BIRTH,
    ]);

    return oidcScopes.reduce(
      this.scopesToRequestedAttributesReducer,
      scopesSet,
    );
  }

  /**
   * For each oidc scope, add the corresponding eIDAS requested attribute to a set
   *
   * @param attributesSet The requested attributes set
   * @param scope the current oidc scope
   * @return The requested attributes set
   */
  private scopesToRequestedAttributesReducer(
    attributesSet: Set<EidasAttributes>,
    scope: string,
  ): Set<EidasAttributes> {
    if (ScopesToRequestedAttributesMap[scope]) {
      ScopesToRequestedAttributesMap[scope].forEach((attribute) => {
        attributesSet.add(attribute);
      });
    }
    return attributesSet;
  }
}
