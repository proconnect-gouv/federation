import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionNoSessionIdException extends SessionBaseException {
  public code = ErrorCode.NO_SESSION_ID;
  public documentation =
    'Cette erreur technique est émise lorsque le session id est introuvable dans l\'objet "req". L\'interceptor de la session a-t-il pu récupérer le cookie de session ?';
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  public ui = 'Session.exceptions.sessionNoSessionId';
}
