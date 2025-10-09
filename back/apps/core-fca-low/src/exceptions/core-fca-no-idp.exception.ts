import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaAgentNoIdpException extends CoreFcaBaseException {
  public email: string;
  public spName: string;
  constructor(spName: string = 'le service', email: string) {
    super();
    this.spName = spName;
    this.email = email;
    this.documentation = `Votre organisation n’autorise pas l’utilisation de ProConnect sur ce service. Merci de créer un compte directement sur ${this.spName}, sans passer par le bouton ProConnect. Si ce comportement vous paraît anormal, vérifiez que votre adresse e-mail (${this.email}) est correcte. Si elle est incorrecte merci de recommencer la cinématique de connexion.`;
    this.description = this.documentation;
  }
  public code = ErrorCode.NO_IDP;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public illustration = 'access-restricted-error';
  public title = 'Accès impossible';
  public displayContact = false;
}
