import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfMissingTokenException extends CsrfBaseException {
  public code = ErrorCode.MISSING_CSRF_TOKEN;
  public error = 'Missing CSRF token';
  public error_description = 'The CSRF token is missing from the request body.';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-470002-jeton-csrf-invalide-m0ijd8/';
}
