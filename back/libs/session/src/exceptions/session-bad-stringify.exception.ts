import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadStringifyException extends SessionBaseException {
  public code = ErrorCode.BAD_STRINGIFY;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
