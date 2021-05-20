/* istanbul ignore file */

// Tested by DTO
import { OidcClientConfig } from '@fc/oidc-client';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'OidcClient');

export default {
  httpOptions: {
    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  jwks: {
    keys: [env.json('CRYPTO_ENC_LOCALE_PRIV_KEY')],
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
