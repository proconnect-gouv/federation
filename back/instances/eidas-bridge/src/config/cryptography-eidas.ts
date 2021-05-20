/* istanbul ignore file */

// Tested by DTO
import { CryptographyEidasConfig } from '@fc/cryptography-eidas';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Cryptography');

export default {
  subSecretKey: env.string('CRYPTO_SUB_SECRET'),
} as CryptographyEidasConfig;
