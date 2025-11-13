import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenResultFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_RESULT_FAILED;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
}
