import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIssuerDiscoveryFailedException extends OidcClientBaseException {
  public code = ErrorCode.ISSUER_DISCOVERY_FAILED;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_GATEWAY;
}
