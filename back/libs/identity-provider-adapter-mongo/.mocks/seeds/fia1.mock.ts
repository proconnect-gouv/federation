export const Fia1IdentityProviderDocument = {
  active: true,
  client_secret:
    'jClItOnQiSZdE4kxm7EWzJbz4ckfD89k1e3NJw/pbGRHD/Jp6ooupqmHTyc3b62L9wqyF2TlR/5hJejE',
  clientID: 'myclientidforfia1-low',
  discovery: true,
  discoveryUrl:
    'https://fia1-low.docker.dev-franceconnect.fr/.well-known/openid-configuration',
  endSessionURL:
    'https://fia1-low.docker.dev-franceconnect.fr/user/session/end',
  fqdns: ['fia1.fr', 'polyfi.fr', 'polyfi2.fr', 'abcd.com'],
  id_token_encrypted_response_alg: '',
  id_token_encrypted_response_enc: '',
  id_token_signed_response_alg: 'ES256',
  isRoutingEnabled: true,
  name: 'fia1-low',
  post_logout_redirect_uris: [
    'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/client/logout-callback',
  ],
  redirect_uris: [
    'https://core-fca-low.docker.dev-franceconnect.fr/api/v2/oidc-callback',
  ],
  siret: '81801912700021',
  statusURL: 'https://fia1-low.docker.dev-franceconnect.fr/',
  supportEmail: 'support+federation@proconnect.gouv.fr',
  title: 'Identity Provider 1 - eIDAS faible - ES256',
  token_endpoint_auth_method: 'client_secret_post',
  trustedIdentity: false,
  uid: '9c716f61-b8a1-435c-a407-ef4d677ec270',
  updatedAt: new Date('2019-04-24 17:09:17'),
  updatedBy: 'admin',
  url: 'https://fia1-low.docker.dev-franceconnect.fr/',
  userinfo_encrypted_response_alg: '',
  userinfo_encrypted_response_enc: '',
  userinfo_signed_response_alg: 'ES256',
  isEntraID: false,
};

/**
 * Fia1-low OpenID Discovery Response Document
 * Used for mocking HTTPS discovery requests in tests
 */
export const Fia1DiscoveryResponseJSON = {
  issuer: 'https://fia1-low.docker.dev-franceconnect.fr',
  authorization_endpoint:
    'https://fia1-low.docker.dev-franceconnect.fr/api/v2/authorize',
  token_endpoint: 'https://fia1-low.docker.dev-franceconnect.fr/api/v2/token',
  jwks_uri: 'https://fia1-low.docker.dev-franceconnect.fr/api/v2/certs',
  userinfo_endpoint:
    'https://fia1-low.docker.dev-franceconnect.fr/api/v2/userinfo',
  end_session_endpoint:
    'https://fia1-low.docker.dev-franceconnect.fr/api/v2/session/end',
  response_types_supported: ['code'],
  subject_types_supported: ['public', 'pairwise'],
  id_token_signing_alg_values_supported: ['ES256', 'RS256', 'HS256'],
  id_token_encryption_alg_values_supported: ['RSA-OAEP', 'RSA-OAEP-256'],
  id_token_encryption_enc_values_supported: ['A256GCM', 'A128GCM'],
  userinfo_signing_alg_values_supported: ['ES256', 'RS256', 'HS256'],
  userinfo_encryption_alg_values_supported: ['RSA-OAEP', 'RSA-OAEP-256'],
  userinfo_encryption_enc_values_supported: ['A256GCM', 'A128GCM'],
  token_endpoint_auth_methods_supported: ['client_secret_post'],
  acr_values_supported: ['eidas1', 'eidas2', 'eidas3'],
};
