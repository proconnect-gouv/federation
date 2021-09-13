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
  acrValue: string;
  encryption: string;
  signature: string;
  description: string;
  enabled: boolean;
  idpId: string;
  mocked: boolean;
}
