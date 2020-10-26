import { SessionBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class SessionNoInteractionCookieException extends SessionBaseException {
  public readonly code = ErrorCode.NO_INTERACTION_COOKIE;
  public message =
    'Should have an interaction cookie (timed out or wrong entry page)';
}
