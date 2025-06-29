import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { AccountBaseException } from './account-base.exception';

export class AccountBlockedException extends AccountBaseException {
  public code = ErrorCode.ACCOUNT_BLOCKED;
  public documentation =
    'Un utilisateur a demandé à ce que sa connexion via FranceConnect soit désactivée. La connexion via ses identifiants est donc impossible désormais. Réactivation du compte nécessaire pour pouvoir procéder à une nouvelle connexion via ce compte.';
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.FORBIDDEN;
  public ui = 'Account.exceptions.accountBlocked';
}
