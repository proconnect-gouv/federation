/* istanbul ignore file */

// Tested by DTO
import { hostname } from 'os';
/**
 * Rename this librairy into a more appropriate name `adapter`, `mongo`
 * @TODO #246
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/246
 */
import { ServiceProviderAdapterEnvConfig } from '@fc/service-provider-adapter-env';

export default {
  active: true,
  name: hostname(),
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  redirect_uris: JSON.parse(process.env.ServiceProviderEnv_REDIRECT_URIS),
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  post_logout_redirect_uris: JSON.parse(
    process.env.ServiceProviderEnv_POST_LOGOUT_REDIRECT_URIS,
  ),
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  client_secret: process.env.ServiceProviderEnv_CLIENT_SECRET,
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  client_id: process.env.ServiceProviderEnv_CLIENT_ID,
  scope: process.env.ServiceProviderEnv_SCOPE,
  // openid defined property names
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token_signed_response_alg:
    process.env.ServiceProviderEnv_ID_TOKEN_SIGNED_RESPONSE_ALG,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token_encrypted_response_alg:
    process.env.ServiceProviderEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ALG,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  id_token_encrypted_response_enc:
    process.env.ServiceProviderEnv_ID_TOKEN_ENCRYPTED_RESPONSE_ENC,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  userinfo_signed_response_alg:
    process.env.ServiceProviderEnv_USERINFO_SIGNED_RESPONSE_ALG,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  userinfo_encrypted_response_alg:
    process.env.ServiceProviderEnv_USERINFO_ENCRYPTED_RESPONSE_ALG,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  userinfo_encrypted_response_enc:
    process.env.ServiceProviderEnv_USERINFO_ENCRYPTED_RESPONSE_ENC,
  // oidc param name
  // eslint-disable-next-line @typescript-eslint/naming-convention
  jwks_uri: process.env.ServiceProviderEnv_JWKS_URI,
} as ServiceProviderAdapterEnvConfig;
