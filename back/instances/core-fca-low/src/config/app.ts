/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';
import { AppConfig } from '@fc/core-fca';

const env = new ConfigParser(process.env, 'App');

export default {
  apiOutputContentType: env.string('API_OUTPUT_CONTENT_TYPE'),
  name: 'CORE_FCA_LOW',
  urlPrefix: '/api/v2',
  assetsPaths: env.json('ASSETS_PATHS'),
  assetsDsfrPaths: env.json('DSFR_ASSETS_PATHS'),
  assetsCacheTtl: env.number('ASSETS_CACHE_TTL'),
  viewsPaths: env.json('VIEWS_PATHS'),
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', { optional: true }),
    cert: env.file('HTTPS_SERVER_CERT', { optional: true }),
  },
  fqdn: process.env.FQDN,
  defaultIdpId: env.string('DEFAULT_IDP_UID'),
  defaultEmailRenater: env.string('DEFAULT_EMAIL_RENATER'),
} as AppConfig;
