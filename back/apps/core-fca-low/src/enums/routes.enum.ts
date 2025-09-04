export enum Routes {
  DEFAULT = '/',
  INTERACTION = '/interaction/:uid',
  INTERACTION_IDENTITY_PROVIDER_SELECTION = '/interaction/identity/select',
  INTERACTION_VERIFY = '/interaction/:uid/verify',
  REDIRECT_TO_IDP = '/redirect-to-idp',
  OIDC_CALLBACK = '/oidc-callback',
  WELL_KNOWN_KEYS = '/client/.well-known/keys',
  DISCONNECT_FROM_IDP = '/client/disconnect-from-idp',
  CLIENT_LOGOUT_CALLBACK = '/client/logout-callback',
}
