import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotDecryptException extends JwtBaseException {
  public documentation = 'Impossible de déchiffrer le JWT';
  public code = ErrorCode.CAN_NOT_DECRYPT;
  static UI = 'Jwt.exceptions.canNotDecrypt';

  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
}
