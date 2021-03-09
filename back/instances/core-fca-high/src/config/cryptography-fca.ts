/* istanbul ignore file */

// Tested by DTO
import { CryptographyFcaConfig } from '@fc/cryptography-fca';

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: process.env.CRYPTO_SUB_SECRET,
} as CryptographyFcaConfig;
