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

    /**
     * Business "exceptions" are by definition not technical issues
     * Thus they do not need to be logged as errors.
     *
     * They will most likely trigger a business log.
     */
    const isBusinessError = exception.constructor['isBusiness'];

    if (!isBusinessError) {
      this.logException(code, id, exception);
    }

    /**
     * Do not render error if the `redirect` flag is set to true.
     * This usually means that the error is supposed to trigger a redirect
     * rather than to display some information.
     *
     * This is typically the case for many oidc parameters.
     * In those scenarios, redirection is handled by `oidc-provider`
     */
    if (exception.redirect === true) {
      return;
    }

    /**
     * @todo #139 allow the exception to set the HTTP response code
     * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/139
     */
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
