import pino, { Logger } from 'pino';
import { v4 as uuidV4 } from 'uuid';

import { Injectable, ShutdownSignal } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import {
  LoggerConfig as MainLoggerConfig,
  LoggerService as MainLoggerService,
} from '@fc/logger';
import { LoggerConfig as LoggerLegacyConfig } from '@fc/logger-legacy/dto';

@Injectable()
export class LoggerService {
  public readonly logger: Logger;

  constructor(private readonly config: ConfigService) {
    const { path } = this.config.get<LoggerLegacyConfig>('LoggerLegacy');
    const { threshold } = this.config.get<MainLoggerConfig>('Logger');

    const stream = pino.destination(path);

    const options = {
      level: threshold,
      customLevels: MainLoggerService.customLevels,
      useOnlyCustomLevels: true,
      formatters: {
        level(label, number) {
          return { levelNumber: number, level: label };
        },
      },
    };

    this.logger = pino(options, stream);

    process.on(ShutdownSignal.SIGUSR2, () => {
      // Keep warnings here, this log must not be in business logs
      console.warn(`SIGUSR2: Reveived, reopening at ${path}`);
      stream.reopen();
      console.warn('SIGUSR2: done');
    });
  }

  businessEvent(log: any) {
    const logId = uuidV4();

    this.logger.info({
      ...log,
      logId,
    });
  }
}
