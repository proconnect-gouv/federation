import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_FAILED;
  public error = 'server_error';
  public error_description =
    'The token request to the authorization server failed.';
  public http_status_code = HttpStatus.BAD_GATEWAY;
}
