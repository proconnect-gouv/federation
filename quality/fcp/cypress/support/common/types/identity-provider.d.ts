export interface IdentityProviderBase {
  selectors: {
    idpButton: string;
    password: string;
    loginButton: string;
    username: string;
  };
  url: string;
}

export interface IdentityProvider extends IdentityProviderBase {
  acrValues: string[];
  description: string;
  enabled: boolean;
  idpId: string;
  mocked: boolean;
}
