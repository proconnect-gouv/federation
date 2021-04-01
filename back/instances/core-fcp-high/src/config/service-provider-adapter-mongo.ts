/* istanbul ignore file */

// Tested by DTO
import { ServiceProviderAdapterMongoConfig } from '@fc/service-provider-adapter-mongo';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as ServiceProviderAdapterMongoConfig;
