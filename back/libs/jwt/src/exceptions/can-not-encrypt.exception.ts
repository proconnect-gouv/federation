import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotEncryptException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_ENCRYPT;
  public documentation = 'Impossible de chiffrer le JWT';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.canNotEncrypt';
}
