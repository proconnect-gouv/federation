/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';
import { IdentityProviderAdapterMongoConfig } from '@fc/identity-provider-adapter-mongo';

const env = new ConfigParser(process.env, 'AdapterMongo');

export default {
  clientSecretEcKey: env.string('CLIENT_SECRET_CIPHER_PASS'),
} as IdentityProviderAdapterMongoConfig;
