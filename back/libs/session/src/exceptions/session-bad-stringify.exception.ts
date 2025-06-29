import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionBadStringifyException extends SessionBaseException {
  public code = ErrorCode.BAD_STRINGIFY;
  public documentation =
    "Les données pour la session se sont mal formatées avant d'être chiffrées. Si le problème persiste, contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Session.exceptions.sessionBadStringify';
}
