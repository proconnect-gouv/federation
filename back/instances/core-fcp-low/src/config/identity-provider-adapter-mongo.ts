/* istanbul ignore file */

// Tested by DTO
import { IdentityProviderAdapterMongoConfig } from '@fc/identity-provider-adapter-mongo';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as IdentityProviderAdapterMongoConfig;
