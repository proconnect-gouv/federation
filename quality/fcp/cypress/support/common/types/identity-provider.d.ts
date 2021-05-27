export interface IdentityProviderBase {
  selectors: {
    idpButton: string;
    password: string;
    submitButton: string;
    userName: string;
  };
  url: string;
}

export interface IdentityProvider extends IdentityProviderBase {
  acrValues: string[];
  enabled: boolean;
  idpId: string;
  mocked: boolean;
}
