import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionStorageException extends SessionBaseException {
  public code = ErrorCode.STORAGE_ISSUE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
