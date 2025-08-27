import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaAgentNoIdpException extends CoreFcaBaseException {
  public documentation =
    'La connexion ne fonctionne pas depuis le réseau sécurisé que vous semblez utiliser. Merci de créer un compte directement sur le site, sans passer par le bouton ProConnect.';
  public code = ErrorCode.NO_IDP;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public description = this.documentation;
  public illustration = 'access-restricted-error';
  public title = 'Accès impossible';

  public displayContact = false;
}
