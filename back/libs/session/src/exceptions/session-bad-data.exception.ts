/* istanbul ignore file */

// Declarative code
import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

export class SessionBadDataException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_DATA;

  constructor(error) {
    super();
    this.message = error;
  }
}
