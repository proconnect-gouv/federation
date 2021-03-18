/* istanbul ignore file */

// Declarative code
import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

export class SessionBadFormatException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_FORMAT;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
