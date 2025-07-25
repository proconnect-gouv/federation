import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionStorageException extends SessionBaseException {
  public code = ErrorCode.STORAGE_ISSUE;
  public documentation =
    'Un problème est survenant lors de la récupération des données de session dans la base Redis. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Session.exceptions.sessionStorage';
}
