import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfBadTokenException extends CsrfBaseException {
  public code = ErrorCode.BAD_CSRF_TOKEN;
  public documentation =
    'le jeton CSRF est invalide. Si le problème persiste, contacter le support N3';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Csrf.exceptions.csrfBadToken';
}
