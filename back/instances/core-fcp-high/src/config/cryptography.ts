/* istanbul ignore file */

// Tested by DTO
import { CryptographyConfig } from '@fc/cryptography';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
  // Core Legacy ==> use of secret cookie key
  subSecretKey: process.env.CRYPTO_SUB_SECRET,
} as CryptographyConfig;
