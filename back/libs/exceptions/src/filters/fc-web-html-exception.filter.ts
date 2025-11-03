import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { ApiErrorParams } from '@fc/app';
import { BaseException } from '@fc/base-exception';
import { ConfigService } from '@fc/config';
import { messageDictionary } from '@fc/core/exceptions/error-messages';
import { LoggerService } from '@fc/logger';
import { SessionService } from '@fc/session';

import { generateErrorId } from '../helpers';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';

@Catch(BaseException)
@Injectable()
export class FcWebHtmlExceptionFilter
  extends FcBaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
  ) {
    super(config, logger);
  }

  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();

    const exceptionParam: ApiErrorParams = {
      exception,
      res,
      error: { code, id, message: exception.ui },
      httpResponseCode: this.getHttpStatus(exception),
      errorDetail: undefined,
    };

    this.logException(code, id, exception);

    this.errorOutput(exceptionParam);
  }

  protected errorOutput(errorParam: ApiErrorParams): void {
    const { httpResponseCode, res } = errorParam;

    const key = errorParam.error.message;
    const staticDetail = key
      ? messageDictionary[key] ||
        messageDictionary['exceptions.default_message']
      : undefined;
    const errorDetail = errorParam.exception.generic
      ? errorParam.exception.error_description
      : staticDetail;

    // These two params are used to generate contactHref
    errorParam.idpName = this.session.get('User', 'idpName');
    errorParam.spName = this.session.get('User', 'spName');

    res.status(httpResponseCode);
    res.render('error', { ...errorParam, errorDetail });
  }
}
