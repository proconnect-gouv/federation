import { isEmpty } from 'lodash';
import pino, { Logger } from 'pino';

import { Inject, Injectable, ShutdownSignal } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { trackedEventSteps } from '../config/tracked-event-steps';
import { LoggerConfig, LoggerLegacyConfig } from '../dto';
import { LogLevels, TrackedEvent } from '../enums';
import { LoggerPluginServiceInterface } from '../interfaces';
import { PLUGIN_SERVICES } from '../tokens';
import { CustomLogLevels } from '../types';

/* istanbul ignore next */
@Injectable()
export class LoggerService {
  // These levels are pino's default.
  // This could be deleted in a near future.
  static readonly customLevels = {
    [LogLevels.FATAL]: 60,
    [LogLevels.ERROR]: 50,
    [LogLevels.WARN]: 40,
    [LogLevels.INFO]: 30,
    [LogLevels.DEBUG]: 20,
    [LogLevels.TRACE]: 10,
  };
  private pino: Logger<keyof CustomLogLevels>;
  private pinoFileLogger: Logger<keyof CustomLogLevels>;

  constructor(
    private readonly config: ConfigService,
    @Inject(PLUGIN_SERVICES)
    private readonly plugins: LoggerPluginServiceInterface[],
  ) {
    this.configure();
  }

  /**
   * Below are the methods to wrap the pino logger levels functions.
   */

  [LogLevels.FATAL](msg: string, ...args: unknown[]);
  [LogLevels.FATAL](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.FATAL](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.FATAL, obj, msg, ...args);
  }

  [LogLevels.ERROR](msg: string, ...args: unknown[]);
  [LogLevels.ERROR](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.ERROR](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.ERROR, obj, msg, ...args);
  }

  [LogLevels.WARN](msg: string, ...args: unknown[]);
  [LogLevels.WARN](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.WARN](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.WARN, obj, msg, ...args);
  }

  [LogLevels.INFO](msg: string, ...args: unknown[]);
  [LogLevels.INFO](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.INFO](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.INFO, obj, msg, ...args);
  }

  [LogLevels.DEBUG](msg: string, ...args: unknown[]);
  [LogLevels.DEBUG](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.DEBUG](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.DEBUG, obj, msg, ...args);
  }

  [LogLevels.TRACE](msg: string, ...args: unknown[]);
  [LogLevels.TRACE](obj: unknown, msg?: string, ...args: unknown[]);
  [LogLevels.TRACE](obj: unknown, msg?: string, ...args: unknown[]): void {
    this.logWithContext(LogLevels.TRACE, obj, msg, ...args);
  }

  track(event: TrackedEvent): void {
    const pluginsContext = this.getContextFromPlugins();
    const trackContext = {
      event,
      step: trackedEventSteps[event],
      ...pluginsContext,
    };

    const { path } = this.config.get<LoggerLegacyConfig>('LoggerLegacy');
    if (!isEmpty(path)) {
      return this.pinoFileLogger.info({
        ...trackContext,
        ...pluginsContext,
      });
    }

    this.pino.info({
      ...trackContext,
      ...pluginsContext,
    });
  }

  private logWithContext(level: LogLevels, ...args: unknown[]): void {
    const pluginsContext = this.getContextFromPlugins();
    const userContext = typeof args[0] === 'string' ? {} : args.shift();
    const finalContext = Object.assign({}, userContext, pluginsContext);

    this.pino[level](finalContext, ...(args as [string?, ...unknown[]]));
  }

  private getContextFromPlugins(): Record<string, unknown> {
    const context = {};

    this.plugins.forEach((plugin) => {
      if (typeof plugin.getContext === 'function') {
        Object.assign(context, plugin.getContext());
      }
    });

    return context;
  }

  private configure() {
    const { threshold } = this.config.get<LoggerConfig>('Logger');
    const customLevels = LoggerService.customLevels;

    const options = {
      level: threshold,
      customLevels,
      useOnlyCustomLevels: true,
      formatters: {
        level(label, number) {
          return { levelNumber: number, level: label };
        },
      },
    };

    this.pino = pino(options);

    const { path } = this.config.get<LoggerLegacyConfig>('LoggerLegacy');
    if (!isEmpty(path)) {
      const stream = pino.destination(path);
      this.pinoFileLogger = pino(options, stream);

      process.on(ShutdownSignal.SIGUSR2, () => {
        // Keep warnings here, this log must not be in business logs
        console.warn(`SIGUSR2: Reveived, reopening at ${path}`);
        stream.reopen();
        console.warn('SIGUSR2: done');
      });
    }

    this.overloadConsole();
    this.pino.info('Logger is ready and native console is now overloaded.');
  }

  private overloadConsole() {
    console.error = this[LogLevels.ERROR].bind(this);
    console.warn = this[LogLevels.WARN].bind(this);
    console.log = this[LogLevels.INFO].bind(this);
    console.info = this[LogLevels.INFO].bind(this);
    console.debug = this[LogLevels.DEBUG].bind(this);
    console.trace = this[LogLevels.TRACE].bind(this);
  }
}
