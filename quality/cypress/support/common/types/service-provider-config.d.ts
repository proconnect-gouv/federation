export interface ServiceProviderConfig extends Record<
  string,
  string | string[] | null
> {
  name: string;
  redirectUri: string;
  redirectUriLogout: string;
  email: string;
  scopes: string[];
  active: string;
  type: string;
  userinfo_signed_response_alg: string | null;
  id_token_signed_response_alg: string;
}
