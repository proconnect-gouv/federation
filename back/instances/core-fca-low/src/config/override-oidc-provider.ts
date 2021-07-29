/* istanbul ignore file */

// Tested by DTO
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'OverrideOidcProvider');

export default {
  sigHsmPubKey: env.json('CRYPTO_SIG_HSM_PUB_KEY'),
} as OverrideOidcProviderConfig;
