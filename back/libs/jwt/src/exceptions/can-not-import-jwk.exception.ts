import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotImportJwkException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_IMPORT_JWK;
  public documentation = "Impossible d'importer le JWK";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.canNotImportJwk';
}
