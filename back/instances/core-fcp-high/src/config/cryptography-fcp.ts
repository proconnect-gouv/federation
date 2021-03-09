/* istanbul ignore file */

// Tested by DTO
import { CryptographyFcpConfig } from '@fc/cryptography-fcp';

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: process.env.CRYPTO_SUB_SECRET,
} as CryptographyFcpConfig;
