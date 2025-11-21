import { ConfigParser } from '@fc/config';
import { OidcClientConfig } from '@fc/oidc-client';

import { Routes } from '../enums';
import app from './app';

const env = new ConfigParser(process.env, 'OidcClient');

export default {
  httpOptions: {
    // Global request timeout used for any outgoing app requests.
    timeout: parseInt(process.env.REQUEST_TIMEOUT, 10),
  },
  jwks: {
    keys: env.json('CRYPTO_ENC_LOCALE_PRIV_KEYS'),
  },
  stateLength: 32,
  /**
   * FCA specific scopes
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/215
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/216
   */
  scope: env.string('SCOPE'),
  // Toggle Financial Grade API
  fapi: env.boolean('FAPI'),
  postLogoutRedirectUri: `https://${app.fqdn}${app.urlPrefix}${Routes.OIDC_LOGOUT_CALLBACK}`,
  redirectUri: `https://${app.fqdn}${app.urlPrefix}${Routes.OIDC_CALLBACK}`,
} as OidcClientConfig;
