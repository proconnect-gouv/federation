import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '@fc/core-fca/enums';
import { CoreFcaBaseException } from '@fc/core-fca/exceptions/core-fca-base.exception';

export class CoreFcaAgentAccountBlockedException extends CoreFcaBaseException {
  public documentation = "Le compte de l’agent.e n'est plus actif.";
  public code = ErrorCode.BLOCKED_ACCOUNT;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'access_denied';
  public error_description = 'authentication aborted due to invalid identity';

  public illustration = 'access-restricted-error';
  public title = 'Accès impossible';
  public description =
    'Votre compte n’est plus actif, vous ne pouvez pas accéder au service demandé.';

  public displayContact = false;
}
