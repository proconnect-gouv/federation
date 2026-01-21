import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaAgentIdpDisabledException extends CoreFcaBaseException {
  public code = ErrorCode.DISABLED_PROVIDER;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-500017-service-temporairement-indisponible-1a52w52/';

  public illustration = 'temporary-restricted-error';
  public title = 'Accès indisponible';
  public description =
    'Un incident technique est en cours. Merci de revenir plus tard.';

  public displayContact = false;
}
