import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreNoSessionIdException extends CoreFcaBaseException {
  public code = ErrorCode.NO_SESSION_ID;
  public documentation =
    'Cette erreur technique est émise lorsque le session id est introuvable dans l\'objet "req". L\'interceptor de la session a-t-il pu récupérer le cookie de session ?';
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  public ui = 'Session.exceptions.sessionNoSessionId';
}
