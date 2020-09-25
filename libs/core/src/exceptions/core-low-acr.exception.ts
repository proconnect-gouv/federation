import { CoreBaseException } from './core-base.exception';
import { ErrorCode } from '../enums';

export class CoreLowAcrException extends CoreBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.LOW_ACR;
}
