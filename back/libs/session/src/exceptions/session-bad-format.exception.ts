import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadFormatException extends SessionBaseException {
  public code = ErrorCode.BAD_SESSION_FORMAT;
  public documentation =
    "Les éléments présents dans la session de l'utilisateur ne sont pas valides. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public ui = 'Session.exceptions.sessionBadFormat';
}
