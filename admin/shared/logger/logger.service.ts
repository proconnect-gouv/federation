import { ConfigService, InjectConfig } from 'nestjs-config';
import { Logger } from '@nestjs/common';
import * as pino from 'pino';
import { LogLevelNames } from './enum/log-levels.enum';
import { pinoLevelsMap, nestLevelsMap } from './log-maps.map';

let logger: any;

export class LoggerService extends Logger {
  constructor(@InjectConfig() readonly config: ConfigService) {
    super(null, false);
    const level = this.config.get('logger.level');

    if (!(level in pinoLevelsMap)) {
      throw new Error('Invalid configuration value for logger');
    }

    logger = pino(
      {
        formatters: {
          level(label: string) {
            return { level: label };
          },
        },
        level,
      },
      pino.destination(this.config.get('logger.path')),
    );
  }

  private canLog(level: string) {
    return pinoLevelsMap[logger.level] <= pinoLevelsMap[level];
  }

  private isDev() {
    return this.config.get('logger.isDevelopement');
  }

  private technicalLogger(level: string, log: any, context?: string) {
    if (this.canLog(level)) {
      super[nestLevelsMap[level]](log, context);
    }
  }

  private businessLogger(level: string, log: any, context?: string) {
    // In order to ease the work of developers,
    // we also send business logs at trace level.
    // (This level is inoperative on environment other than dev)
    this.trace(log, context);

    if (this.canLog(level)) {
      logger[level](log);
    }
  }

  // Method which will never output in production
  trace(log: any, context?: string) {
    if (this.isDev()) {
      this.technicalLogger(LogLevelNames.LOG, log, context);
    }
  }

  // Alias of trace
  log(log: any, context?: string) {
    this.trace(log, context);
  }

  // Method that might add more info in production
  verbose(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.VERBOSE, log, context);
  }

  debug(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.DEBUG, log, context);
  }

  info(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.INFO, log, context);
  }

  // Errors
  warn(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.WARN, log, context);
  }

  error(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.ERROR, log, context);
  }

  fatal(log: any, context?: string) {
    this.technicalLogger(LogLevelNames.FATAL, log, context);
  }

  // Business logic, goes in event logs
  businessEvent(log: any, context?: string) {
    this.businessLogger(LogLevelNames.INFO, log, context);
  }
}
