import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionNotFoundException extends SessionBaseException {
  public readonly code = ErrorCode.NOT_FOUND;
  public message = 'Session not found';
}
