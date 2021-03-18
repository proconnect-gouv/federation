/* istanbul ignore file */

// Declarative code
import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

export class SessionNoSessionCookieException extends SessionBaseException {
  public readonly code = ErrorCode.NO_SESSION_COOKIE;
  public message =
    'Should have a session cookie (timed out or wrong entry page)';
}
