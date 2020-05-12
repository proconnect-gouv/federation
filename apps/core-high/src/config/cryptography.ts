import { CryptographyConfig } from '@fc/cryptography';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
  identityHashSalt: process.env.IDENTITY_HASH_SALT,
} as CryptographyConfig;
