import { BaseExceptionFilter } from '@nestjs/core';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ExceptionsService } from '../exceptions.service';

@Catch()
export class UnhandledExceptionFilter
  extends BaseExceptionFilter
  implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  catch(exception: Error, host: ArgumentsHost) {
    this.logger.debug('Exception from UnhandledException');

    const res = host.switchToHttp().getResponse();
    const code = ExceptionsService.getExceptionCodeFor();
    const id = ExceptionsService.generateErrorId();

    const { name, message, stack } = exception;
    const stackTrace = stack.split('\n');

    this.logger.error({
      type: name,
      code,
      id,
      message,
      stackTrace,
    });

    res.status(500);
    res.render('error', {
      code,
      id,
      message,
    });
  }
}
