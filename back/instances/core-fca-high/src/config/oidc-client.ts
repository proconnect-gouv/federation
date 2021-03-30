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
  jwks: {
    keys: [JSON.parse(process.env.CRYPTO_ENC_LOCALE_PRIV_KEY)],
  },
  stateLength: 32,
  /**
   * FCA specific scopes
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/215
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/216
   */
  scope:
  'openid uid given_name usual_name email siren siret organizational_unit belonging_population phone chorusdt',
} as OidcClientConfig;
