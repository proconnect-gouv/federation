/* istanbul ignore file */

// Tested by DTO

import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'App');

export default {
  name: 'MOCK_IDENTITY_PROVIDER_AGENCY_HIGH',
  urlPrefix: '',
  citizenDatabasePath: env.string('CITIZEN_DATABASE_PATH'),
};
