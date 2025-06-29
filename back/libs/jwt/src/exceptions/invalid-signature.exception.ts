import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class InvalidSignatureException extends JwtBaseException {
  public code = ErrorCode.INVALID_SIGNATURE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.invalidSignature';
}
