import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadAliasException extends SessionBaseException {
  public code = ErrorCode.BAD_SESSION_ALIAS;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
}
