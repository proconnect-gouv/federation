import { CoreFcpBaseException } from './core-fcp-base.exception';
import { ErrorCode } from '../enums';

export class CoreFcpMissingIdentity extends CoreFcpBaseException {
  code = ErrorCode.MISSING_IDENTITY;
  message = 'No identity for SP found in session';
}
