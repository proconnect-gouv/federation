/* istanbul ignore file */

// Tested by DTO
import { IdentityProviderEnvConfig } from '@fc/identity-provider-env/dto';
import { parseBoolean } from '@fc/common';

export default {
  jwks: {
    keys: [JSON.parse(process.env.JWKS)],
  },
  discovery: parseBoolean(process.env.DISCOVERY),
  discoveryUrl: process.env.DISCOVERY_URL,
  provider: {
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_id: process.env.CLIENT_ID,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    client_secret: process.env.CLIENT_SECRET,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    response_types: ['code'],
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    redirect_uris: JSON.parse(process.env.REDIRECT_URIS),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    post_logout_redirect_uris: JSON.parse(
      process.env.POST_LOGOUT_REDIRECT_URIS,
    ),
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_signed_response_alg: process.env.ID_TOKEN_SIGNED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_alg:
      process.env.ID_TOKEN_ENCRYPTED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    id_token_encrypted_response_enc:
      process.env.ID_TOKEN_ENCRYPTED_RESPONSE_ENC,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_signed_response_alg: process.env.USERINFO_SIGNED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_alg:
      process.env.USERINFO_ENCRYPTED_RESPONSE_ALG,
    // oidc param name
    // eslint-disable-next-line @typescript-eslint/naming-convention
    userinfo_encrypted_response_enc:
      process.env.USERINFO_ENCRYPTED_RESPONSE_ENC,
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
