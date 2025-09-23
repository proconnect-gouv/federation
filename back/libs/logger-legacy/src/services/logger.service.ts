import pino, { Logger } from 'pino';
import { v4 as uuidV4 } from 'uuid';

import { Injectable, ShutdownSignal } from '@nestjs/common';

import { ConfigService } from '@fc/config';
import { LoggerConfig as LoggerLegacyConfig } from '@fc/logger-legacy/dto';

@Injectable()
export class LoggerService {
  public readonly logger: Logger;

  constructor(private readonly config: ConfigService) {
    const { path } = this.config.get<LoggerLegacyConfig>('LoggerLegacy');

    const stream = pino.destination(path);

    this.logger = pino(
      {
        formatters: {
          /**
           * Formatter for pino library
           * @see https://github.com/pinojs/pino/blob/master/docs/api.md#formatters-object
           */
          level: (label, _number) => ({ level: label }),
        },
        level: 'info',
      },
      stream,
    );

    process.on(ShutdownSignal.SIGUSR2, () => {
      // Keep warnings here, this log must not be in business logs
      console.warn(`SIGUSR2: Reveived, reopening at ${path}`);
      stream.reopen();
      console.warn('SIGUSR2: done');
    });
  }

  businessEvent(log) {
    const logId = uuidV4();

    this.logger.info({
      ...log,
      logId,
    });
  }
}
