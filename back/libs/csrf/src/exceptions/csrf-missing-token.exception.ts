import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfMissingTokenException extends CsrfBaseException {
  public code = ErrorCode.MISSING_CSRF_TOKEN;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-470002-jeton-csrf-invalide-m0ijd8/';
}
