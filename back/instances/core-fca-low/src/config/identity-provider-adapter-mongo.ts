/* istanbul ignore file */

// Tested by DTO
import { IdentityProviderAdapterMongoConfig } from '@fc/identity-provider-adapter-mongo';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'AdapterMongo');

export default {
  clientSecretEcKey: env.string('CLIENT_SECRET_CIPHER_PASS'),
} as IdentityProviderAdapterMongoConfig;
