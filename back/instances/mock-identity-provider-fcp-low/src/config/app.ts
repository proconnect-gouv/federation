/* istanbul ignore file */

// Tested by DTO
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'App');

export default {
  name: process.env.APP_NAME,
  urlPrefix: '',
  citizenDatabasePath: env.string('CITIZEN_DATABASE_PATH'),
};
