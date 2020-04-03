import { OidcClientConfig } from '@fc/oidc-client';

export default {
  reloadConfigDelayInMs: 60000,
  jwks: {
    keys: JSON.parse(process.env.CRYPTO_ENC_DETECTOR_KEY),
  },
} as OidcClientConfig;
