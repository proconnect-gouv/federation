import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadCookieException extends SessionBaseException {
  public code = ErrorCode.BAD_COOKIE;
  public documentation =
    "Cette erreur technique est émise lorsque le cookie de session contient une valeur anormale. Ne devrait pas se produire en dehors d'une connexion malveillante.";
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'user authentication aborted';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  public ui = 'Session.exceptions.sessionBadCookie';
}
