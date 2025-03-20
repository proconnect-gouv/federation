import { ConfigParser } from '@fc/config';
import { CoreConfig } from '@fc/core';

const env = new ConfigParser(process.env, 'Core');

export default {
  allowedIdpHints: env.json('ALLOWED_IDP_HINTS'),
  defaultRedirectUri: 'https://www.proconnect.gouv.fr',
  supportEmail: 'support+federation@proconnect.gouv.fr',
} as CoreConfig;
