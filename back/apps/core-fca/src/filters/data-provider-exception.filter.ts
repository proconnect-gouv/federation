import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { ApiContentType } from '@fc/app';
import { FcException } from '@fc/exceptions';
import { ExceptionCaughtEvent } from '@fc/exceptions/events';
import { FcWebJsonExceptionFilter } from '@fc/exceptions/filters';
import { generateErrorId } from '@fc/exceptions/helpers';

@Catch(FcException)
@Injectable()
export class DataProviderExceptionFilter
  extends FcWebJsonExceptionFilter
  implements ExceptionFilter
{
  catch(exception: FcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const code = this.getExceptionCodeFor(exception);
    const id = generateErrorId();

    this.logException(code, id, exception);
    this.eventBus.publish(new ExceptionCaughtEvent(exception, { req }));

    const httpResponseCode = this.getHttpStatus(exception);
    res.set('Content-Type', ApiContentType.JSON);
    res.status(httpResponseCode);

    res.json({
      error: exception.error,
      error_description: exception.error_description,
    });
  }
}
