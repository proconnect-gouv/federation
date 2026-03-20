import { IdpMetadata, PcfClientMetadata } from "../dto";

export type IdentityProviderMetadata = {
  pcfClientMetadata: PcfClientMetadata;
  idpMetadata: IdpMetadata;
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
