import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { EventBus } from '@nestjs/cqrs';

import { ApiErrorParams } from '@fc/app';
import { BaseException } from '@fc/base-exception';
import { ConfigService } from '@fc/config';
import { LoggerService } from '@fc/logger';

import { ExceptionCaughtEvent } from '../events';
import { generateErrorId } from '../helpers';
import { FcBaseExceptionFilter } from './fc-base.exception-filter';

@Catch(BaseException)
@Injectable()
export class FcWebJsonExceptionFilter
  extends FcBaseExceptionFilter
  implements ExceptionFilter
{
  constructor(
    protected readonly config: ConfigService,
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
    const message = exception.ui;

    const exceptionParam = {
      exception,
      res,
      error: { code, id, message },
      httpResponseCode: this.getHttpStatus(exception),
      errorDetail: undefined,
    };

    this.logException(code, id, exception);

    this.eventBus.publish(new ExceptionCaughtEvent(exception, { req }));

    this.errorOutput(exceptionParam);
  }

  protected errorOutput(errorParam: ApiErrorParams): void {
    const { httpResponseCode, res, error: baseError, exception } = errorParam;
    const { error, error_description, error_detail } = exception as any;

    res.status(httpResponseCode);
    res.json({
      ...baseError,
      error,
      error_description,
      error_detail,
    });
  }
}
