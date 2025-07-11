import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { ApiErrorParams } from '@fc/app';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { OidcProviderNoWrapperException } from '@fc/oidc-provider/exceptions/oidc-provider-no-wrapper.exception';
import { SessionService } from '@fc/session';

import { messageDictionary } from '../../../../apps/core-fca/src/exceptions/error-messages';
import { ExceptionCaughtEvent } from '../events';
import { FcException } from '../exceptions';
import { BaseException } from '../exceptions/base.exception';
import { generateErrorId } from '../helpers';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';

@Catch(FcException)
@Injectable()
export class FcWebHtmlExceptionFilter
  extends FcBaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    protected readonly config: ConfigService,
    protected readonly session: SessionService,
    protected readonly logger: LoggerService,
    protected readonly eventBus: EventBus,
  ) {
    super(config, logger, eventBus);
  }

  catch(exception: BaseException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse();
    const req = ctx.getRequest();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();

    let message = 'exceptions.default_message';
    if (exception instanceof OidcProviderNoWrapperException) {
      message = exception.originalError.constructor.name;
    } else {
      message = exception.ui;
    }

    const exceptionParam: ApiErrorParams = {
      exception,
      res,
      error: { code, id, message },
      httpResponseCode: this.getHttpStatus(exception),
      errorDetail: undefined,
    };

    exceptionParam.idpName = this.session.get('User', 'idpName');
    exceptionParam.spName = this.session.get('User', 'spName');

    this.logException(code, id, exception);

    this.eventBus.publish(new ExceptionCaughtEvent(exception, { req }));

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

    res.status(httpResponseCode);
    res.render('error', { ...errorParam, errorDetail });
  }
}
