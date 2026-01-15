import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientMissingStateException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_STATE;
  public error = 'invalid_request';
  public error_description =
    'The state parameter is missing from the authorization request.';
  public http_status_code = HttpStatus.BAD_REQUEST;
}
