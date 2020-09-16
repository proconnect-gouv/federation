import { CoreFcpBaseException } from './core-fcp-base.exception';
import { ErrorCode } from '../enums';

export class CoreFcpInvalidAcrException extends CoreFcpBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.INVALID_ACR;
}
