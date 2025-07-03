import { LogLevels } from './enum/log-levels.enum';

/**
 * Map log levels between pino and nestJS
 *
 * NestJS has `log` and `verbose`
 * Pino has `trace` and `fatal`
 *
 */
export const pinoLevelsMap = {
  log: LogLevels.TRACE,
  trace: LogLevels.TRACE,
  verbose: LogLevels.DEBUG,
  debug: LogLevels.DEBUG,
  info: LogLevels.INFO,
  warn: LogLevels.WARN,
  error: LogLevels.ERROR,
  fatal: LogLevels.FATAL,
};

export const nestLevelsMap = {
  log: 'log',
  verbose: 'verbose',
  trace: 'log',
  debug: 'debug',
  info: 'log',
  warn: 'warn',
  error: 'error',
  fatal: 'error',
};
