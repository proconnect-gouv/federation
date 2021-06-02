/* istanbul ignore file */

// Tested by DTO

import { AppConfig } from '@fc/mock-identity-provider';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'App');

export default {
  name: 'MOCK_IDENTITY_PROVIDER_AGENCY_HIGH',
  urlPrefix: '',
  citizenDatabasePath: env.string('CITIZEN_DATABASE_PATH'),
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', { optional: true }),
    cert: env.file('HTTPS_SERVER_CERT', { optional: true }),
  },
} as AppConfig;
