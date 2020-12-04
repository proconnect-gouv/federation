/* istanbul ignore file */

// Tested by DTO
import { CryptographyConfig } from '@fc/cryptography';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as CryptographyConfig;
