import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadCookieException extends SessionBaseException {
  public code = ErrorCode.BAD_COOKIE;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-190012-cookie-de-session-invalide-1n59f9w/';
  public http_status_code = HttpStatus.UNAUTHORIZED;
}
