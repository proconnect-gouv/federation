import { IdentityConfig } from 'libs/identity/src';

export default {
  cryptographyKey: process.env.USERINFO_CRYPT_KEY,
} as IdentityConfig;
