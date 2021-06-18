/* istanbul ignore file */

// Tested by DTO
import { LoggerConfig } from '@fc/logger';
import { ConfigParser } from '@fc/config';

const env = new ConfigParser(process.env, 'Logger');

export default {
  path: env.string('FILE'),
  level: env.string('LEVEL'),
  isDevelopment: process.env.NODE_ENV === 'development',
} as LoggerConfig;
