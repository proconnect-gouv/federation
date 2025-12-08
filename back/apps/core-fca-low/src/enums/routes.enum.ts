export enum Routes {
  DEFAULT = '/',
  INTERACTION = '/interaction/:uid',
  INTERACTION_VERIFY = '/interaction/:uid/verify',
  INTERACTION_ERROR = '/interaction/:uid/error',
  REDIRECT_TO_IDP = '/redirect-to-idp',
  IDENTITY_PROVIDER_SELECTION = '/identity-provider-selection',
  OIDC_CALLBACK = '/oidc-callback',
  OIDC_LOGOUT_CALLBACK = '/client/logout-callback',
}
