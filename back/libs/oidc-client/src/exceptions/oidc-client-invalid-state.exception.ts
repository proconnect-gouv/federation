import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientInvalidStateException extends OidcClientBaseException {
  public code = ErrorCode.INVALID_STATE;
  public error = 'invalid_request';
  public error_description =
    'The provided state parameter does not match the state currently stored in the session.';
  public http_status_code = HttpStatus.FORBIDDEN;
}
