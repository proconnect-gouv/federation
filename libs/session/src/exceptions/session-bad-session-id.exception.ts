import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionBadSessionIdException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_SESSION_ID;
  public message = 'Bad Session id';
}
