/* istanbul ignore file */

// Tested by DTO
import { CryptographyEidasConfig } from '@fc/cryptography-eidas';

export default {
  subSecretKey: process.env.CRYPTO_SUB_SECRET,
} as CryptographyEidasConfig;
