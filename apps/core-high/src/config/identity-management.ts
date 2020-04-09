import { IdentityManagementConfig } from '@fc/identity-management';

export default {
  cryptographyKey: process.env.USERINFO_CRYPT_KEY,
} as IdentityManagementConfig;
