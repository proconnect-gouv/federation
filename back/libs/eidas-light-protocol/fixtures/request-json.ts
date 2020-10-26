import { IRequest } from '../src/interfaces';
export const requestJsonMock: IRequest = {
  citizenCountryCode: 'BE',
  id: 'Auduye7263',
  issuer: 'EIDASBridge',
  levelOfAssurance: 'http://eidas.europa.eu/LoA/low',
  nameIdFormat: 'unspecified',
  providerName: 'FranceConnect',
  spType: 'public',
  relayState: 'myState',
  requestedAttributes: [
    'PersonIdentifier',
    'CurrentFamilyName',
    'CurrentGivenName',
    'DateOfBirth',
    'CurrentAddress',
    'Gender',
    'BirthName',
    'PlaceOfBirth',
  ],
};
