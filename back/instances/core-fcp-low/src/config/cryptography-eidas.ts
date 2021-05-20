/* istanbul ignore file */

// Tested by DTO
import { CryptographyEidasConfig } from '@fc/cryptography-eidas';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Cryptography');

export default {
  // Core Legacy ==> use of secret cookie key
  subSecretKey: env.string('SUB_SECRET'),
} as CryptographyEidasConfig;
