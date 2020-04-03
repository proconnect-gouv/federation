import { Logger, Injectable } from '@nestjs/common';
import * as pino from 'pino';
import { ConfigService } from '@fc/config';
import { LogLevelNames } from './enum';
import { pinoLevelsMap, nestLevelsMap } from './log-maps.map';
import { LoggerConfig } from './dto';

/**
 * For usage and good practices:
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/wikis/Logger
 */
@Injectable()
export class LoggerService extends Logger {
  private config: LoggerConfig;
  private externalLogger: any;

  constructor(private readonly configService: ConfigService) {
    super(null, false);
    this.config = this.configService.get<LoggerConfig>('Logger');

    const { level, path } = this.config;

    this.externalLogger = pino(
      { useLevelLabels: true, level: pinoLevelsMap[level] },
      pino.destination(path),
    );

    this.overrideNativeConsole();
  }

  private internalLogger(level, log, context) {
    // We can't mock a parent class
    // istanbul ignore next line
    super[level](log, context);
  }

  private canLog(level: string) {
    return pinoLevelsMap[this.externalLogger.level] <= pinoLevelsMap[level];
  }

  private isDev() {
    return this.config.isDevelopment;
  }

  private technicalLogger(level: string, log: any, context?: string) {
    if (this.canLog(level)) {
      this.internalLogger(nestLevelsMap[level], log, context);
    }
  }

  private businessLogger(level: string, log: any, context?: string) {
    // In order to ease the work of developers,
    // we also send business logs at trace level.
    // (This level is inoperative on environment other than dev)
    this.trace(log, context);

    if (this.canLog(level)) {
      this.externalLogger[level](log);
    }
  }

  private overrideNativeConsole() {
    const methods = ['log', 'error', 'debug', 'info', 'warn'];
    const context = 'Native Console';

    methods.forEach(method => {
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
  businessEvent(log: any, context?: string) {
    this.businessLogger(LogLevelNames.INFO, log, context);
  }
}
