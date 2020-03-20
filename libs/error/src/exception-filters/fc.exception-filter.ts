import { BaseExceptionFilter } from '@nestjs/core';
import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { FcException } from '../interfaces';
import { LoggerService } from '@fc/logger';
import { ErrorService } from '../error.service';

@Catch(FcException)
export class FcExceptionFilter extends BaseExceptionFilter
  implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
    this.logger.setContext(this.constructor.name);
  }

  catch(exception: FcException, host: ArgumentsHost) {
    this.logger.debug('Exception from FcException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    const { message, stack } = exception;

    this.logger.warn({
      type: 'FcException',
      code,
      id,
      message,
      stack,
    });

    res.status(500);
    res.render('error', { code, id, message });
  }

  static ArgumentHostAdapter(ctx) {
    return {
      switchToHttp: () => ({
        getResponse: () => ctx.res,
      }),
    };
  }
}
