import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfBadTokenException extends CsrfBaseException {
  public code = ErrorCode.BAD_CSRF_TOKEN;
  public error = 'Bad CSRF token';
  public error_description =
    'The provided CSRF token does not match the token currently stored in the session.';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-470001-session-expiree-ou-invalide-1tpi0l2/';
}
