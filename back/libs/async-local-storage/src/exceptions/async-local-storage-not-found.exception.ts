import { ErrorCode } from '../enum';
import { AsyncLocalStorageBaseException } from './async-local-storage-base.exception';

export class AsyncLocalStorageNotFoundException extends AsyncLocalStorageBaseException {
  public code = ErrorCode.ASYNC_LOCAL_STORAGE_NOT_FOUND;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
