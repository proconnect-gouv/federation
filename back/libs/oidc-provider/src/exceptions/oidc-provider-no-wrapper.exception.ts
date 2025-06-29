import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcProviderBaseRenderedException } from './oidc-provider-base-rendered.exception';

export class OidcProviderNoWrapperException extends OidcProviderBaseRenderedException {
  public code = ErrorCode.NO_WRAPPER;
  public documentation =
    'Une erreur émise par la librairie OIDC Provider de manière dynamique, il est nécessaire de consulter les logs pour en savoir plus.';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcProvider.exceptions.OidcProviderNoWrapperException';
  public http_status_code = HttpStatus.BAD_REQUEST;
}
