import { OidcClientConfig } from '@fc/oidc-client';

export default {
  reloadConfigDelayInMs: 60000,
  jwks: {
    keys: [JSON.parse(process.env.CRYPTO_ENC_LOCALE_PRIV_KEY)],
  },
} as OidcClientConfig;
