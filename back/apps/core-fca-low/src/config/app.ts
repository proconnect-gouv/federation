import { ConfigParser } from '@fc/config';
import { AppConfig } from '@fc/core';

const env = new ConfigParser(process.env, 'App');

export default {
  name: 'CORE_FCA_LOW',
  urlPrefix: '/api/v2',
  assetsDsfrPaths: [
    {
      assetPath: '../../../node_modules/@gouvfr/dsfr/dist/dsfr',
      prefix: '/dsfr',
    },
    {
      assetPath: '../../../node_modules/@gouvfr/dsfr/dist/fonts',
      prefix: '/fonts',
    },
    {
      assetPath: '../../../node_modules/@gouvfr/dsfr/dist/icons',
      prefix: '/icons',
    },
    {
      assetPath: '../../../node_modules/@gouvfr/dsfr/dist/utility/icons',
      prefix: '/utility',
    },
  ],

  assetsCacheTtl: env.number('ASSETS_CACHE_TTL'),
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', true),
    cert: env.file('HTTPS_SERVER_CERT', true),
  },
  fqdn: process.env.FQDN,
  defaultIdpId: env.string('DEFAULT_IDP_UID'),
  spAuthorizedFqdnsConfigs: env.json('SP_AUTHORIZED_FQDNS_CONFIGS'),
  defaultEmailRenater: env.string('DEFAULT_EMAIL_RENATER'),
  contentSecurityPolicy: {
    defaultSrc: ["'self'", 'client.crisp.chat'],
    styleSrc: ["'self'", "'unsafe-inline'", 'client.crisp.chat'],
    scriptSrc: [
      "'self'",
      'stats.data.gouv.fr',
      "'unsafe-inline'",
      'client.crisp.chat',
      'blob:',
    ],
    connectSrc: [
      "'self'",
      'stats.data.gouv.fr',
      'client.crisp.chat',
      'wss://client.relay.crisp.chat',
      'storage.crisp.chat',
    ],
    frameAncestors: [],
    frameSrc: ['proconnect.crisp.help'],
    imgSrc: [
      "'self'",
      'data:',
      'stats.data.gouv.fr',
      'client.crisp.chat',
      'image.crisp.chat',
      'storage.crisp.chat',
      'wss://client.relay.crisp.chat',
    ],
  },
  displayTestEnvWarning: env.boolean('FEATURE_DISPLAY_TEST_ENV_WARNING'),
  defaultRedirectUri: 'https://www.proconnect.gouv.fr',
  supportEmail: 'support+federation@proconnect.gouv.fr',
  passeDroitEmailSuffix: '+proconnect',
} as AppConfig;
