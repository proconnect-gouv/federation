import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

export class CoreInvalidCsrfException extends CoreBaseException {
  code = ErrorCode.INVALID_CSRF;
  message = 'Invalid csrf';
}
