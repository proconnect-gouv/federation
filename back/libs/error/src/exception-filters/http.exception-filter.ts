import {
  ExceptionFilter,
  Catch,
  HttpException,
  ArgumentsHost,
} from '@nestjs/common';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';
import { ErrorService } from '../error.service';

@Catch(HttpException)
export class HttpExceptionFilter
  extends FcBaseExceptionFilter
  implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    this.logger.debug('Exception from HttpException');

    const res = host.switchToHttp().getResponse();
    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    const { message } = exception.getResponse() as any;

    this.logException(code, id, exception);

    res.status(exception.getStatus());
    res.render('error', {
      code,
      id,
      message,
    });
  }
}
