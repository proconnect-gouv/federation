import * as _ from 'lodash';
import { Injectable } from '@nestjs/common';
import { OidcError, AcrValues } from '@fc/oidc';
import {
  EidasAttributes,
  EidasResponse,
  EidasResponseAttributes,
  EidasStatusCodes,
  EidasSubStatusCodes,
} from '@fc/eidas';
import { LoggerService } from '@fc/logger';
import {
  OidcToEidasAttributesMap,
  OidcToEidasLevelOfAssurancesMap,
} from '../mappers';
import { IOidcIdentity } from '../interfaces';

@Injectable()
export class OidcToEidasService {
  constructor(private readonly logger: LoggerService) {
    logger.setContext(this.constructor.name);
  }

  /**
   * Takes oidc claims and acr and return the corresponding eIDAS fields
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @param acr The eIDAS level used for authentication
   * @param requestedAttributes The eIDAS requested attributes
   * @return A partial eidas response
   */
  mapSuccessPartialResponse(
    claims: Partial<IOidcIdentity>,
    acr: AcrValues,
    requestedAttributes: EidasAttributes[],
  ): Partial<EidasResponse> {
    const attributes = this.mapAttributes(claims, requestedAttributes);

    return {
      subject: claims.sub,
      levelOfAssurance: OidcToEidasLevelOfAssurancesMap[acr],
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
  mapFailurePartialResponse(error: Error | OidcError): Partial<EidasResponse> {
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
  private mapAttributes(
    claims: Partial<IOidcIdentity>,
    requestedAttributes: EidasAttributes[],
  ): EidasResponseAttributes {
    return requestedAttributes.reduce(
      this.getClaimsBoundedRequestedAttributesReducer(claims),
      {},
    );
  }

  /**
   * Bind the claims to the requestedAttributesReducer
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @return The requestedAttributesReducer with bounded claims
   */
  private getClaimsBoundedRequestedAttributesReducer(
    claims: Partial<IOidcIdentity>,
  ) {
    return this.requestedAttributesReducer.bind(OidcToEidasService, claims);
  }

  /**
   * Takes oidc claims and acr and return the corresponding eIDAS attributes
   *
   * @param claims The oidc claims retrieved from the userinfos endpoint
   * @param attributes The object containing the eIDAS response attributes
   * @param requestedAttributes The eIDAS requested attributes
   * @return The eidas response attributes
   */
  private requestedAttributesReducer(
    claims: Partial<IOidcIdentity>,
    attributes: EidasResponseAttributes,
    requestedAttribute: EidasAttributes,
  ) {
    if (OidcToEidasAttributesMap[requestedAttribute]) {
      attributes[requestedAttribute] = OidcToEidasAttributesMap[
        requestedAttribute
      ](claims);
    }

    return attributes;
  }
}
