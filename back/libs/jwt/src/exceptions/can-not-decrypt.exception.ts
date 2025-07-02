import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotDecryptException extends JwtBaseException {
  public documentation = 'Impossible de déchiffrer le JWT';
  public code = ErrorCode.CAN_NOT_DECRYPT;
  public ui = 'Jwt.exceptions.canNotDecrypt';

  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
