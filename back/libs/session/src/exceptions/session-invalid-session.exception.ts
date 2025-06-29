import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionInvalidSessionException extends SessionBaseException {
  public code = ErrorCode.INVALID_SESSION;
  public documentation =
    "La Session n'est pas valide'. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'user authentication aborted';
  static HTTP_STATUS_CODE = HttpStatus.CONFLICT;
  static UI = 'Session.exceptions.sessionInvalidSession';
}
