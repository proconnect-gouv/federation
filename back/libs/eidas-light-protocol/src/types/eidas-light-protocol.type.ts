/* istanbul ignore file */

// Declarative code
/**
 * List of attributes for natural persons
 * @see https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS+eID+Profile?preview=/82773108/148898847/eIDAS%20SAML%20Attribute%20Profile%20v1.2%20Final.pdf
 * chapter 2.2.2
 */
export type RequestedAttributes =
  | 'PersonIdentifier'
  | 'CurrentFamilyName'
  | 'CurrentGivenName'
  | 'DateOfBirth'
  | 'CurrentAddress'
  | 'Gender'
  | 'BirthName'
  | 'PlaceOfBirth';

export type SubjectNameIdFormat = 'persistent' | 'transient' | 'unspecified';

export type LevelOfAssurance = 'low' | 'substantial' | 'high';

export type StatusCode = 'Success' | 'Requester' | 'Responder';

export type SubStatusCode =
  | 'AuthnFailed'
  | 'InvalidAttrNameOrValue'
  | 'InvalidNameIDPolicy'
  | 'VersionMismatch'
  | 'RequestDenied'
  | 'statusMessage';
