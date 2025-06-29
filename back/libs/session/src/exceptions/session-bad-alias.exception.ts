import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadAliasException extends SessionBaseException {
  public code = ErrorCode.BAD_SESSION_ALIAS;
  public documentation =
    "L'identifiant de session n'est pas valide, il n'est pas possible de trouver une session correspondante. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'user authentication aborted';
  public ui = 'Session.exceptions.sessionBadAlias';
}
