import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionNoSessionCookieException extends SessionBaseException {
  public readonly code = ErrorCode.NO_SESSION_COOKIE;
  public message =
    'Should have a session cookie (timed out or wrong entry page)';
}
