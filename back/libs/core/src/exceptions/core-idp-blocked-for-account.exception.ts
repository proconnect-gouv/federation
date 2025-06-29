import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreIdpBlockedForAccountException extends CoreBaseException {
  public code = ErrorCode.CORE_IDP_BLOCKED_FOR_ACCOUNT;
  public documentation =
    "Le fournisseur d'identité a été bloqué par l'utilisateur.";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.FORBIDDEN;
  public ui = 'Core.exceptions.coreIdpBlockedForAccount';
}
