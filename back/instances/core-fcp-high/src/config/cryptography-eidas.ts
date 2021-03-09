/* istanbul ignore file */

// Tested by DTO
import { CryptographyEidasConfig } from '@fc/cryptography-eidas';

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: process.env.CRYPTO_SUB_SECRET,
} as CryptographyEidasConfig;
