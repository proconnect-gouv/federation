/* istanbul ignore file */

// Tested by DTO
import { readFileSync } from 'fs';
import { OidcClientConfig } from '@fc/oidc-client';

export default {
  httpOptions: {
    key: readFileSync(process.env.HTTPS_CLIENT_KEY).toString('utf8'),
    cert: readFileSync(process.env.HTTPS_CLIENT_CERT).toString('utf8'),

    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  stateLength: 32,

  scope: process.env.OidcClient_SCOPE,
} as OidcClientConfig;
