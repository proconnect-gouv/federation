import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientUserinfoFailedException extends OidcClientBaseException {
  public code = ErrorCode.USERINFO_FAILED;
  public error = 'Userinfo request failed';
  public error_description =
    'The userinfo request to the authorization server failed.';
  public http_status_code = HttpStatus.BAD_GATEWAY;
}
