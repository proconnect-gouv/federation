import { ErrorCode } from '../enum';
import { JwtBaseException } from './jwt-base.exception';

export class FetchJwksFailedException extends JwtBaseException {
  public code = ErrorCode.FETCH_JWKS_FAILED;
  public documentation =
    'Impossible pour le jwt service de joindre le JWKS endpoint';
  public error = 'server_error';
  public error_description = 'failed to fetch JWKS';
  public ui = 'Jwt.exceptions.fetchJwksFailed';
}
