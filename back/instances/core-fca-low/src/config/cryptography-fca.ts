/* istanbul ignore file */

// Tested by DTO
import { CryptographyFcaConfig } from '@fc/cryptography-fca';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'CryptographyFca');

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: env.string('CRYPTO_SUB_SECRET'),
  hashSecretKey: env.string('CRYPTO_HASH_SECRET'),
} as CryptographyFcaConfig;
