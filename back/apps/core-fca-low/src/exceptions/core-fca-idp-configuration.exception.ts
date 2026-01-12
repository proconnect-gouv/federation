import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaIdpConfigurationException extends CoreFcaBaseException {
  public code = ErrorCode.MISCONFIGURED_PROVIDER;
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-500026-probleme-de-configuration-du-service-1ubru2i/';

  public illustration = 'temporary-restricted-error';
  public title = 'Accès impossible';
  public description =
    'Un incident technique sur ce fournisseur d’identité est en cours. Merci de revenir plus tard.';

  public displayContact = false;
}
