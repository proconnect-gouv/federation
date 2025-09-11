import { ClientMetadata, IssuerMetadata } from '../dto';

/**
 * Alias and export interface provided by `openid-client` from our module,
 * so that we do not expose our depency to `openid-client`.
 */
export interface IdpFCModal {
  active: boolean;
  title: string;
  body: string;
  continueText: string;
  moreInfoLabel?: string;
  moreInfoUrl?: string;
}

export interface IdpFCMetadata {
  uid: string;
  url: string;
  name: string;
  image: string;
  title: string;
  active: boolean;
  display: boolean;
  discovery: boolean;
  discoveryUrl?: string;
  allowedAcr: string[];
  amr: string[];
  modal?: IdpFCModal;
  siret: string;
  supportEmail: string;
}

export type IdentityProviderMetadata = IdpFCMetadata & {
  client: ClientMetadata;
  issuer: IssuerMetadata;
};
