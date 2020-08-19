import { CoreFcpBaseException } from './core-fcp-base.exception';
import { ErrorCode } from '../enums';

export class CoreFcpInvalidCsrfException extends CoreFcpBaseException {
  code = ErrorCode.INVALID_CSRF;
  message = 'Invalid csrf';
}
