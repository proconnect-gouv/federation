import { RequestedAttributes } from '../types';

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
