import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaAgentAccountBlockedException extends CoreFcaBaseException {
  public code = ErrorCode.BLOCKED_ACCOUNT;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'access_denied';
  public error_description = 'authentication aborted due to invalid identity';

  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-500024-compte-bloque-18ylybk/';

  public illustration = 'access-restricted-error';
  public title = 'Accès impossible';
  public description =
    'Votre compte n’est plus actif, vous ne pouvez pas accéder au service demandé.';

  public displayContact = false;
}
