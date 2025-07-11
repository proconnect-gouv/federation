import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcProviderBaseRenderedException } from './oidc-provider-base-rendered.exception';

export class OidcProviderMissingAtHashException extends OidcProviderBaseRenderedException {
  public code = ErrorCode.MISSING_AT_HASH;
  public documentation =
    "Le claim at_hash n'a pas été trouvé dans l'id_token_hint lors du logout";
  public error = 'invalid_request';
  public error_description = 'Core.exceptions.coreMissingAtHash';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'Core.exceptions.coreMissingAtHash';
}
