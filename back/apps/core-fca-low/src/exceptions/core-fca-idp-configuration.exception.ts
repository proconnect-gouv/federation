import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaIdpConfigurationException extends CoreFcaBaseException {
  public code = ErrorCode.MISCONFIGURED_PROVIDER;
  public documentation =
    'Le FI est mal configuré et ne peut être utilisé par ProConnect, si le problème persiste, contacter le support ProConnect.';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;

  public illustration = 'temporary-restricted-error';
  public title = 'Accès impossible';
  public description =
    'Un incident technique est en cours. Merci de revenir plus tard.';

  public displayContact = false;
}
