/* istanbul ignore file */

// Tested by DTO
import { IdentityProviderEnvConfig } from '@fc/identity-provider-env/dto';
import { parseJsonProperty } from '@fc/common';

export default {
  jwks: {
    keys: [parseJsonProperty(process.env, 'JWKS')],
  },
  // No discovery URL for legacy core
  discoveryUrl: undefined,
  provider: {
    issuer: 'https://fcp.docker.dev-franceconnect.fr',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: process.env.CLIENT_ID,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: process.env.CLIENT_SECRET,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    authorization_endpoint: process.env.AUTHORIZATION_ENDPOINT,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_endpoint: process.env.TOKEN_ENDPOINT,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_endpoint: process.env.USERINFO_ENDPOINT,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: ['code'],
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: parseJsonProperty(process.env, 'REDIRECT_URIS'),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    post_logout_redirect_uris: parseJsonProperty(
      process.env,
      'POST_LOGOUT_REDIRECT_URIS',
    ),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: 'HS256',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention

    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc: 'plain',
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention

    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention

    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention

    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri: process.env.JWKS_URI,
    //oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_endpoint_auth_method: process.env.TOKEN_ENDPOINT_AUTH_METHOD,
    //oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    revocation_endpoint_auth_method:
      process.env.REVOCATION_ENDPOINT_AUTH_METHOD,
  },
} as IdentityProviderEnvConfig;
