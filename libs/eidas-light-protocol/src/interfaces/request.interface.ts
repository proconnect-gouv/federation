/**
 * List of attributes for natural persons
 * @see https://ec.europa.eu/cefdigital/wiki/display/CEFDIGITAL/eIDAS+eID+Profile?preview=/82773108/148898847/eIDAS%20SAML%20Attribute%20Profile%20v1.2%20Final.pdf
 * chapter 2.2.2
 */

type RequestedAttributes =
  | 'PersonIdentifier'
  | 'CurrentFamilyName'
  | 'CurrentGivenName'
  | 'DateOfBirth'
  | 'CurrentAddress'
  | 'Gender'
  | 'BirthName'
  | 'PlaceOfBirth';

export interface IRequest {
  citizenCountryCode: string;
  id: string;
  issuer: string;
  levelOfAssurance: string;
  nameIdFormat: string;
  providerName: string;
  spType: string;
  relayState: string;
  requestedAttributes: RequestedAttributes[];
}
