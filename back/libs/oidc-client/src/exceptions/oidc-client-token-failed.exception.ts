import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_FAILED;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_GATEWAY;

  constructor(
    params?: { contactEmail: string; isDefaultIdp: boolean },
    error?: Error | string,
  ) {
    super(params?.contactEmail, error);
    if (params?.isDefaultIdp) {
      this.displayContact = false;
      this.contactMessage = undefined;
    }
  }
}
