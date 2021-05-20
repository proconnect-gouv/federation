/* istanbul ignore file */

// Tested by DTO
import { CryptographyFcpConfig } from '@fc/cryptography-fcp';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Cryptography');

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: env.string('CRYPTO_SUB_SECRET'),
} as CryptographyFcpConfig;
