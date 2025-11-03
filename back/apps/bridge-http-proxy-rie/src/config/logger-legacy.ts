import { ConfigParser } from '@fc/config';
import { LoggerLegacyConfig } from '@fc/logger';

const env = new ConfigParser(process.env, 'LoggerLegacy');

export default {
  path: env.string('FILE'),
} as LoggerLegacyConfig;
