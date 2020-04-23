import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';
import { ErrorService } from '../error.service';

@Catch(HttpException)
export class HttpExceptionFilter extends FcBaseExceptionFilter
  implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.debug('Exception from HttpException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    const { message } = exception;

    this.logException(code, id, exception);

    res.status(500);
    res.render('error', {
      code,
      id,
      message,
    });
  }
}
