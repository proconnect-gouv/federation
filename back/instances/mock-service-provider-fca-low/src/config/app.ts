/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';
import { AppConfig } from '@fc/mock-service-provider';

const env = new ConfigParser(process.env, 'App');

export default {
  name: 'MOCK_SERVICE_PROVIDER_HIGH',
  urlPrefix: '',
  defaultAcrValue: process.env.OidcClient_ACR,
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', { optional: true }),
    cert: env.file('HTTPS_SERVER_CERT', { optional: true }),
  },
} as AppConfig;
