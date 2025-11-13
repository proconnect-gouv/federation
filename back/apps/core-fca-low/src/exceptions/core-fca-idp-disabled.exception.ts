import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaAgentIdpDisabledException extends CoreFcaBaseException {
  public code = ErrorCode.DISABLED_PROVIDER;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public illustration = 'temporary-restricted-error';
  public title = 'Accès indisponible';
  public description =
    'Un incident technique est en cours. Merci de revenir plus tard.';

  public displayContact = false;
}
