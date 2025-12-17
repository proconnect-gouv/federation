import { ErrorCode } from '../enums';
import { CsrfBaseException } from './csrf-base.exception';

export class CsrfBadTokenException extends CsrfBaseException {
  public code = ErrorCode.BAD_CSRF_TOKEN;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-470001-session-expiree-ou-invalide-1tpi0l2/';
}
