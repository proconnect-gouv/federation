/* istanbul ignore file */

// Declarative code
/**
 * List of attributes for natural persons
 * @see https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS+eID+Profile?preview=/82773108/148898847/eIDAS%20SAML%20Attribute%20Profile%20v1.2%20Final.pdf
 * chapter 2.2.2
 */
declare type RequestedAttributes =
  | 'PersonIdentifier'
  | 'CurrentFamilyName'
  | 'CurrentGivenName'
  | 'DateOfBirth'
  | 'CurrentAddress'
  | 'Gender'
  | 'BirthName'
  | 'PlaceOfBirth';

declare type SubjectNameIdFormat = 'persistent' | 'transient' | 'unspecified';

declare type LevelOfAssurance = 'low' | 'substantial' | 'high';

declare type StatusCode = 'Success' | 'Requester' | 'Responder';

declare type SubStatusCode =
  | 'AuthnFailed'
  | 'InvalidAttrNameOrValue'
  | 'InvalidNameIDPolicy'
  | 'VersionMismatch'
  | 'RequestDenied'
  | 'statusMessage';
