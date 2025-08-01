export interface IIdentityProviderLegacy {
  uid: string;
  name: string;
  url: string;
  hoverMsg: string;
  hoverRedirectLink: string;
  active: boolean;
  display: boolean;
  isBeta: boolean;
  title: string;
  image: string;
  alt: string;
  imageFocus: string;
  eidas: number;
  allowedAcr?: string[];
  mailto: string;
  statusURL: string;
  authzURL?: string;
  tokenURL?: string;
  userInfoURL?: string;
  endSessionURL: string;
  discoveryUrl?: string;
  discovery: boolean;
  clientID: string;
  client_secret: string;
  order: number;
  jwksURL?: string;
  jwtAlgorithm: string[];
  trustedIdentity: boolean;
  specificText: string;
  createdAt: Date;
  updatedAt: Date;
  updatedBy: string;
  blacklistByIdentityProviderActivated: boolean;
  WhitelistByServiceProviderActivated: boolean;
  userinfo_encrypted_response_enc?: string;
  userinfo_encrypted_response_alg?: string;
  userinfo_signed_response_alg?: 'RS256' | 'ES256' | 'HS256' | '';
  id_token_signed_response_alg?: 'RS256' | 'ES256' | 'HS256';
  id_token_encrypted_response_alg?: string;
  id_token_encrypted_response_enc?: string;
  token_endpoint_auth_method?: string;
  revocation_endpoint_auth_method?: string;
  amr?: string[];
  featureHandlers?: Record<string, string>;
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  response_types?: string[];
  modal?: {
    active: boolean;
    title: string;
    body: string;
    continueText: string;
    moreInfoLabel: string;
    moreInfoUrl: string;
  };
}
