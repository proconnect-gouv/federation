import { FederationClientMetadata, FederationServerMetadata } from "../dto";

export type IdentityProviderMetadata = {
  federationClientMetadata: FederationClientMetadata;
  federationServerMetadata: FederationServerMetadata;
  uid: string;
  url: string;
  name: string;
  title: string;
  active: boolean;
  discovery: boolean;
  discoveryUrl?: string;
  siret: string;
  supportEmail?: string;
  fqdns?: string[];
  isRoutingEnabled: boolean;
  isEntraID: boolean;
  extraAcceptedEmailDomains?: string[];
  isBlockingForUnlistedEmailDomainsEnabled: boolean;
};
