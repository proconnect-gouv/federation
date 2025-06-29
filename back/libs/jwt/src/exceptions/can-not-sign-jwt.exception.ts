import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class CanNotSignJwtException extends JwtBaseException {
  public code = ErrorCode.CAN_NOT_SIGN_JWT;
  public documentation = 'Impossible de signer le JWT';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Jwt.exceptions.canNotSignJwt';
}
