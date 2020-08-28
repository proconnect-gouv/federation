/* istanbul ignore file */

// Tested by DTO
import { OidcClientConfig } from '@fc/oidc-client';

export default {
  reloadConfigDelayInMs: 60000,
  httpOptions: {
    key: process.env.HTTPS_CLIENT_KEY,
    cert: process.env.HTTPS_CLIENT_CERT,
    
    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  jwks: {
    keys: [JSON.parse(process.env.CRYPTO_ENC_LOCALE_PRIV_KEY)],
  },
  stateLength: 16,
} as OidcClientConfig;
