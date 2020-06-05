import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionBadFormatException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_FORMAT;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
