import { HttpStatus } from '@nestjs/common';

import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderBaseRedirectException extends OidcProviderBaseException {
  public http_status_code = HttpStatus.SEE_OTHER;
}
