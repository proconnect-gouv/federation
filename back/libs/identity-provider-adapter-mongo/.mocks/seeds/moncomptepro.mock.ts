export const MonCompteProIdentityProviderDocument = {
  active: true,
  client_secret:
    'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
  clientID: 'myclientidformoncomptepro',
  discovery: true,
  discoveryUrl:
    'https://moncomptepro.docker.dev-franceconnect.fr/.well-known/openid-configuration',
  endSessionURL:
    'https://moncomptepro.docker.dev-franceconnect.fr/user/session/end',
  fqdns: ['moncomptepro.fr', 'polyfi.fr'],
  id_token_encrypted_response_alg: '',
  id_token_encrypted_response_enc: '',
  id_token_signed_response_alg: 'ES256',
  isRoutingEnabled: true,
  name: 'moncomptepro',
  post_logout_redirect_uris: [
    'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
  ],
  redirect_uris: [
    'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
  ],
  siret: '12345678910009',
  supportEmail: 'support+federation@proconnect.gouv.fr',
  title: 'Identity Provider MonComptePro',
  token_endpoint_auth_method: 'client_secret_post',
  trustedIdentity: false,
  uid: '71144ab3-ee1a-4401-b7b3-79b44f7daeeb',
  updatedAt: new Date('2019-04-24 17:09:17'),
  updatedBy: 'admin',
  url: 'https://moncomptepro.docker.dev-franceconnect.fr',
  userinfo_encrypted_response_alg: '',
  userinfo_encrypted_response_enc: '',
  userinfo_signed_response_alg: 'ES256',
};

export const MonCompteProDiscoveryResponseJSON = {
  issuer: 'https://moncomptepro.docker.dev-franceconnect.fr',
  authorization_endpoint:
    'https://moncomptepro.docker.dev-franceconnect.fr/authorize',
  token_endpoint: 'https://moncomptepro.docker.dev-franceconnect.fr/token',
  jwks_uri: 'https://moncomptepro.docker.dev-franceconnect.fr/jwks',
  userinfo_endpoint:
    'https://moncomptepro.docker.dev-franceconnect.fr/userinfo',
  end_session_endpoint:
    'https://moncomptepro.docker.dev-franceconnect.fr/user/session/end',
  response_types_supported: ['code'],
  subject_types_supported: ['public'],
  id_token_signing_alg_values_supported: ['ES256'],
  token_endpoint_auth_methods_supported: ['client_secret_post'],
};
