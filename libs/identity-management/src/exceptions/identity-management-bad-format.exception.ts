import { IdentityManagementBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class IdentityManagementBadFormatException extends IdentityManagementBaseException {
  public readonly code = ErrorCode.BAD_FORMAT;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
