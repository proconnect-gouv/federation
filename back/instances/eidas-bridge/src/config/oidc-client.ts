/* istanbul ignore file */

// Tested by DTO
import { OidcClientConfig } from '@fc/oidc-client';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'OidcClient');

export default {
  httpOptions: {
    key: env.file('HTTPS_CLIENT_KEY'),
    cert: env.file('HTTPS_CLIENT_CERT'),

    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  jwks: {
    keys: [env.json('JWKS')],
  },
  stateLength: 32,
  // Do not ask for scope since they are built at run time.

  // Toogle Financial Grade API
  fapi: env.boolean('FAPI'),
} as OidcClientConfig;
