/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';
import { OidcClientConfig } from '@fc/oidc-client';

const env = new ConfigParser(process.env, 'OidcClient');

export default {
  httpOptions: {
    key: env.file('HTTPS_CLIENT_KEY'),
    cert: env.file('HTTPS_CLIENT_CERT'),
    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  stateLength: 32,

  /**
   * OIDC Standard scopes
   * @see https://openid.net/specs/openid-connect-basic-1_0.html#Scopes
   */
  scope: env.string('SCOPE'),
} as OidcClientConfig;
