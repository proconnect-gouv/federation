import { BaseExceptionFilter } from '@nestjs/core';
import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { LoggerService } from '@fc/logger';
import { ErrorService } from '../error.service';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter
  implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.debug('Exception from HttpException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    const { message, stack } = exception;

    this.logger.warn({
      type: 'HttpException',
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
