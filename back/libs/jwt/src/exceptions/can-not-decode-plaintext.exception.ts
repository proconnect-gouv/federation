import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotDecodePlaintextException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_DECODE_PLAINTEXT;
  public documentation = 'Impossible de décoder le JWT une fois déchiffré';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.canNotDecodePlaintext';
}
