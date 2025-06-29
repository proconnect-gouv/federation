import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionCannotCommitUndefinedSession extends SessionBaseException {
  public code = ErrorCode.CANNOT_COMMIT;
  public documentation =
    "La session n'a pas été trouvé au moment ou elle aurait due être sauvegardée. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public ui = 'Session.exceptions.sessionCannotCommitUndefinedSession';
}
