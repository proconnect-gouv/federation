export interface ServiceProviderConfig
  extends Record<string, string | string[]> {
  name: string;
  redirectUri: string;
  redirectUriLogout: string;
  emails: string[];
  ipAddresses: string[];
  scopes: string[];
  active: string;
  type: string;
  userinfo_signed_response_alg: string;
  id_token_signed_response_alg: string;
}
