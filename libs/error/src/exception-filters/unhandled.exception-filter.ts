import { BaseExceptionFilter } from '@nestjs/core';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ErrorService } from '../error.service';

@Catch()
export class UnhandledExceptionFilter extends BaseExceptionFilter
  implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.debug('Exception from UnhandledException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor();
    const id = ErrorService.generateErrorId();

    const { name, message, stack } = exception;

    this.logger.error({
      type: name,
      code,
      id,
      message,
      stack,
    });

    res.status(500);
    res.render('error', {
      code,
      id,
      message,
    });
  }
}
