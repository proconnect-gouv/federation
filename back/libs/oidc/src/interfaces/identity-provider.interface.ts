import { ClientMetadata, IssuerMetadata } from '../dto';

export interface IdpFCMetadata {
  uid: string;
  url: string;
  name: string;
  title: string;
  active: boolean;
  discovery: boolean;
  discoveryUrl?: string;
  siret: string;
  supportEmail: string;
  fqdns?: string[];
}

export type IdentityProviderMetadata = IdpFCMetadata & {
  client: ClientMetadata;
  issuer: IssuerMetadata;
};
