/* istanbul ignore file */

// Declarative code
import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

export class SessionBadSessionIdException extends SessionBaseException {
  public readonly code = ErrorCode.BAD_SESSION_ID;
  public message = 'Bad Session id';
}
