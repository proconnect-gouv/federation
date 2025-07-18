import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';

import { UnknownException } from '../exceptions';
import { FcWebHtmlExceptionFilter } from './fc-web-html-exception.filter';

@Catch()
@Injectable()
export class UnknownHtmlExceptionFilter
  extends FcWebHtmlExceptionFilter
  implements ExceptionFilter
{
  catch(exception: Error, host: ArgumentsHost) {
    const wrapped = new UnknownException(exception);

    super.catch(wrapped, host);
  }
}
