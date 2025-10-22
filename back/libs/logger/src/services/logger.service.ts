import pino, { Logger } from 'pino';

import { Inject, Injectable } from '@nestjs/common';

import { ConfigService } from '@fc/config';

import { LoggerConfig } from '../dto';
import { LogLevels } from '../enums';
import { LoggerPluginServiceInterface } from '../interfaces';
import { PLUGIN_SERVICES } from '../tokens';
import { CustomLogLevels } from '../types';

/* istanbul ignore next */
@Injectable()
export class LoggerService {
  private readonly customLevels = {
    [LogLevels.FATAL]: 60,
    [LogLevels.ERROR]: 50,
    [LogLevels.WARN]: 40,
    [LogLevels.INFO]: 30,
    [LogLevels.DEBUG]: 20,
    [LogLevels.TRACE]: 10,
  };
  private pino: Logger<keyof CustomLogLevels>;

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
    const customLevels = this.customLevels;

    const options = {
      level: threshold,
      customLevels,
      useOnlyCustomLevels: true,
    };

    this.pino = pino(options);

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
