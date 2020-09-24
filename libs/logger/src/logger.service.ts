import { v4 as uuidV4 } from 'uuid';
import * as pino from 'pino';
import { Logger, Injectable } from '@nestjs/common';
import { ConfigService } from '@fc/config';
import { LogLevelNames } from './enum';
import { pinoLevelsMap, nestLevelsMap } from './log-maps.map';
import { LoggerConfig } from './dto';
import { IBusinessEvent } from './interfaces';

/**
 * For usage and good practices:
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/wikis/Logger
 */
@Injectable()
export class LoggerService extends Logger {
  private externalLogger: any;

  constructor(private readonly config: ConfigService) {
    super(null, false);
    const { level, path } = this.config.get<LoggerConfig>('Logger');

    this.externalLogger = pino(
      {
        formatters: {
          level(label: string, _number: number) {
            return { level: label };
          },
        },
        level: pinoLevelsMap[level],
      },
      pino.destination(path),
    );

    this.overrideNativeConsole();
  }

  private getIdentifiedLog(log) {
    const logId = uuidV4();
    return {
      ...log,
      logId,
    };
  }

  // Proxy `super`, cause we can't mock a parent class
  // istanbul ignore next line
  private internalLogger(level, log, context) {
    super[level](log, context);
  }

  private canLog(level: string) {
    return pinoLevelsMap[this.externalLogger.level] <= pinoLevelsMap[level];
  }

  private isDev() {
    const { isDevelopment } = this.config.get<LoggerConfig>('Logger');
    return isDevelopment;
  }

  private technicalLogger(level: string, log: any, context?: string) {
    if (this.canLog(level)) {
      let message = log;
      if (!this.isDev()) {
        try {
          message = JSON.stringify(log);
        } catch (error) {
          this.internalLogger(
            nestLevelsMap.warn,
            'could not JSON stringify a log',
            context,
          );
          message = log;
        }
      }
      this.internalLogger(nestLevelsMap[level], message, context);
    }
  }

  private businessLogger(level: string, log: any, context?: string) {
    // In order to ease the work of developers,
    // we also send business logs at trace level.
    // (This level is inoperative on environment other than dev)
    this.trace(log, context);

    if (this.canLog(level)) {
      this.externalLogger[level](this.getIdentifiedLog(log));
    }
  }

  private overrideNativeConsole() {
    const methods = ['log', 'error', 'debug', 'info', 'warn'];
    const context = 'Native Console';

    methods.forEach((method) => {
      console[method] = (...args) => this[method](args.join('\n'), context);
    });
  }

  // Method which will never output in production
  trace(log: any, context?: string) {
    if (this.isDev()) {
      this.technicalLogger(LogLevelNames.TRACE, log, context);
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
  businessEvent(log: IBusinessEvent, context?: string) {
    this.businessLogger(LogLevelNames.INFO, log, context);
  }
}
