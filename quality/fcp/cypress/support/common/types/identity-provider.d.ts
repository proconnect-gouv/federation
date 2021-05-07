export interface IdentityProviderBase {
  selectors: {
    password: string;
    submitButton: string;
    userName: string;
  };
  url: string;
}

export interface IdentityProvider extends IdentityProviderBase {
  acrValues: [string];
  idpId: string;
}
