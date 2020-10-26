/* istanbul ignore file */

// Tested by DTO
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';

export default {
  sigHsmPubKey: JSON.parse(process.env.CRYPTO_SIG_HSM_PUB_KEY),
} as OverrideOidcProviderConfig;
