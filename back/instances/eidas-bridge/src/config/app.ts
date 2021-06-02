/* istanbul ignore file */

// Tested by DTO
import { AppConfig } from '@fc/eidas-bridge';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'App');

export default {
  name: 'EIDAS_BRIDGE',
  urlPrefix: '',
  countryIsoList: env.json('AVAILABLE_COUNTRIES'),
  httpsOptions: {
    key: env.file('HTTPS_SERVER_KEY', { optional: true }),
    cert: env.file('HTTPS_SERVER_CERT', { optional: true }),
  },
} as AppConfig;
