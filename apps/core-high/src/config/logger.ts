import { LoggerConfig } from '@fc/logger';

export default {
  path: process.env.EVT_LOG_FILE,
  level: process.env.LOG_LEVEL,
  isDevelopement: process.env.NODE_ENV === 'development',
} as LoggerConfig;
