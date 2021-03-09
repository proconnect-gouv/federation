/* istanbul ignore file */

// Tested by DTO
import { IdentityProviderConfig } from '@fc/identity-provider';

export default {
  clientSecretEcKey: process.env.CLIENT_SECRET_CIPHER_PASS,
} as IdentityProviderConfig;
