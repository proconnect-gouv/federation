import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionInvalidSessionException extends SessionBaseException {
  public code = ErrorCode.INVALID_SESSION;
  public documentation =
    "La Session n'est pas valide'. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.CONFLICT;
  public ui = 'Session.exceptions.sessionInvalidSession';
}
