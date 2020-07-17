import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionBadDataException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_DATA;

  constructor(error) {
    super();
    this.message = error;
  }
}
