import { ErrorCode } from '../enum';
import { AsyncLocalStorageBaseException } from './async-local-storage-base.exception';

export class AsyncLocalStorageNotFoundException extends AsyncLocalStorageBaseException {
  public code = ErrorCode.ASYNC_LOCAL_STORAGE_NOT_FOUND;
  public documentation =
    "Le store n'a pas pu être récupéré dans le présent contexte. Vérifiez que l'appel actuel se situe bien dans le contexte du callback de l'appel à \"run\". Voir également la documentation NodeJS de AsyncLocalStorage pour plus de détail.";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'AsyncLocalStorage.exceptions.asyncLocalStorageNotFound';
}
