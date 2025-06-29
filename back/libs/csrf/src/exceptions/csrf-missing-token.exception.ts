import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfMissingTokenException extends CsrfBaseException {
  public code = ErrorCode.MISSING_CSRF_TOKEN;
  public documentation =
    "le jeton CSRF n'a pas été envoyé. Si le problème persiste, contacter le support N3";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'Csrf.exceptions.csrfMissingToken';
}
