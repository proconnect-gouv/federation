export enum OidcClientRoutes {
  REDIRECT_TO_IDP = '/redirect-to-idp',
  OIDC_CALLBACK = '/oidc-callback/:providerUid',
  WELL_KNOWN_KEYS = '/client/.well-known/keys',
}
