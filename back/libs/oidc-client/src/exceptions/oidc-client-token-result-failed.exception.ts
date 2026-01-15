import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenResultFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_RESULT_FAILED;
  public error = 'server_error';
  public error_description =
    'The validation of the token result from the authorization server failed.';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
}
