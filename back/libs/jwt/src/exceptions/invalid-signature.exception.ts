import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class InvalidSignatureException extends JwtBaseException {
  public code = ErrorCode.INVALID_SIGNATURE;
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'Jwt.exceptions.invalidSignature';
}
