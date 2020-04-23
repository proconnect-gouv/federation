import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { FcException } from '../exceptions';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';
import { ErrorService } from '../error.service';

@Catch(FcException)
export class FcExceptionFilter extends FcBaseExceptionFilter
  implements ExceptionFilter {
  catch(exception: FcException, host: ArgumentsHost) {
    this.logger.debug('Exception from FcException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    const { message } = exception;

    this.logException(code, id, exception);

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
