import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotEncryptException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_ENCRYPT;
  public documentation = 'Impossible de chiffrer le JWT';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.canNotEncrypt';
}
