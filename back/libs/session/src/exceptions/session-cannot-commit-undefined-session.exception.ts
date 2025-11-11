import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionCannotCommitUndefinedSession extends SessionBaseException {
  public code = ErrorCode.CANNOT_COMMIT;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
}
