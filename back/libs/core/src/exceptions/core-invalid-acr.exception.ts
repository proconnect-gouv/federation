import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

export class CoreInvalidAcrException extends CoreBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.INVALID_ACR;
}
