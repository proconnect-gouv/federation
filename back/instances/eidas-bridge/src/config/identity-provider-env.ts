/* istanbul ignore file */

// Tested by DTO
import { parseBoolean } from '@fc/common';
import { IdentityProviderEnvConfig } from '@fc/identity-provider-env';

export default {
  jwks: {
    keys: [JSON.parse(process.env.IdentityProviderEnv_JWKS)],
  },
  discovery: parseBoolean(process.env.IdentityProviderEnv_DISCOVERY),
  discoveryUrl: process.env.IdentityProviderEnv_DISCOVERY_URL,
  provider: {
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: process.env.IdentityProviderEnv_CLIENT_ID,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: process.env.IdentityProviderEnv_CLIENT_SECRET,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: ['code'],
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: JSON.parse(process.env.IdentityProviderEnv_REDIRECT_URIS),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    post_logout_redirect_uris: JSON.parse(
      process.env.IdentityProviderEnv_POST_LOGOUT_REDIRECT_URIS,
    ),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg:
      process.env.IdentityProviderEnv_ID_TOKEN_SIGNED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_alg:
      process.env.IdentityProviderEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc:
      process.env.IdentityProviderEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_signed_response_alg:
      process.env.IdentityProviderEnv_USERINFO_SIGNED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_alg:
      process.env.IdentityProviderEnv_USERINFO_ENCRYPTED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_enc:
      process.env.IdentityProviderEnv_USERINFO_ENCRYPTED_RESPONSE_ENC,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    jwks_uri: process.env.IdentityProviderEnv_JWKS_URI,
    //oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    token_endpoint_auth_method:
      process.env.IdentityProviderEnv_TOKEN_ENDPOINT_AUTH_METHOD,
    //oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    revocation_endpoint_auth_method:
      process.env.IdentityProviderEnv_REVOCATION_ENDPOINT_AUTH_METHOD,
  },
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as IdentityProviderEnvConfig;
