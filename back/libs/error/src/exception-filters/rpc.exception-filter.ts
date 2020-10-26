import { Observable, throwError } from 'rxjs';
import { ExceptionFilter, Catch } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';
import { ErrorService } from '../error.service';

/**
 * Generic RPC exception filter
 * @see https://docs.nestjs.com/microservices/exception-filters
 */
@Catch(RpcException)
export class RpcExceptionFilter
  extends FcBaseExceptionFilter
  implements ExceptionFilter {
  catch(exception: RpcException): Observable<any> {
    this.logger.debug('Exception from RpcException');

    const code = ErrorService.getExceptionCodeFor(exception);
    const id = ErrorService.generateErrorId();

    this.logException(code, id, exception);
    return throwError(exception.getError());
  }
}
