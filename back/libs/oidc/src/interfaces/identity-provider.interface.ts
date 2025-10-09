import { ClientMetadata, IssuerMetadata } from '../dto';

export type IdentityProviderMetadata = {
  client: ClientMetadata;
  issuer: IssuerMetadata;
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
  isRoutingEnabled: boolean;
};
