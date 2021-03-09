/* istanbul ignore file */

// Tested by DTO
import { ServiceProviderConfig } from '@fc/service-provider';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as ServiceProviderConfig;
