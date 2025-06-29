import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreIdpBlockedForAccountException extends CoreBaseException {
  public code = ErrorCode.CORE_IDP_BLOCKED_FOR_ACCOUNT;
  public documentation =
    "Le fournisseur d'identité a été bloqué par l'utilisateur.";
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'user authentication aborted';
  static HTTP_STATUS_CODE = HttpStatus.FORBIDDEN;
  static UI = 'Core.exceptions.coreIdpBlockedForAccount';
}
