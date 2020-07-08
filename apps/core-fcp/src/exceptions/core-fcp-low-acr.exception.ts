import { CoreFcpBaseException } from './core-fcp-base.exception';
import { ErrorCode } from '../enums';

export class CoreFcpLowAcrException extends CoreFcpBaseException {
  scope = 2; // identity provider scope
  code = ErrorCode.LOW_ACR;
}
