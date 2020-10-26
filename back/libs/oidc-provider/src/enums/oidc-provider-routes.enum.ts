export enum OidcProviderRoutes {
  AUTHORIZATION = '/authorize',
  CHECK_SESSION = '/session/check',
  CODE_VERIFICATION = '/device',
  DEVICE_AUTHORIZATION = '/device/auth',
  END_SESSION = '/session/end',
  INTROSPECTION = '/token/introspection',
  JWKS = '/jwks',
  PUSHED_AUTHORIZATION_REQUEST = '/request',
  REGISTRATION = '/reg',
  REVOCATION = '/token/revocation',
  TOKEN = '/token',
  USERINFO = '/userinfo',
}
