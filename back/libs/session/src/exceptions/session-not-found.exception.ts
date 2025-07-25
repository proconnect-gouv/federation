import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionNotFoundException extends SessionBaseException {
  public code = ErrorCode.NOT_FOUND;
  public documentation =
    "Erreur émise lorsque l'usager n'a plus de session, probablement une fenêtre restée ouverte au delà des 10 minutes. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  public ui = 'Session.exceptions.sessionNotFound';
}
