import { IdentityManagementBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class IdentityManagementNotFoundException extends IdentityManagementBaseException {
  public readonly code = ErrorCode.NOT_FOUND;
  public message = 'Identity not found';
}
