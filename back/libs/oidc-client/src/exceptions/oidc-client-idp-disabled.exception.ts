import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIdpDisabledException extends OidcClientBaseException {
  public code = ErrorCode.DISABLED_PROVIDER;
  public documentation =
    'Le FI est désactivé, si le problème persiste, contacter le support N3';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
  public ui = 'OidcClient.exceptions.oidcClientIdpDisabled';
}
