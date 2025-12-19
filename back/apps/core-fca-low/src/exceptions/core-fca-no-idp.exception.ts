import { escape } from 'lodash';

import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaAgentNoIdpException extends CoreFcaBaseException {
  constructor(
    public spName: string = 'le service',
    public email: string,
  ) {
    super();
    this.description = `Votre organisation n’autorise pas l’utilisation de ProConnect sur ce service. Merci de créer un compte directement sur ${escape(this.spName)}, sans passer par le bouton ProConnect. Si ce comportement vous paraît anormal, vérifiez que l’adresse e-mail utilisée (${escape(this.email)}) est correcte. Si elle ne l’est pas, recommencez le parcours de connexion. Dans le cas contraire, vous pouvez consulter le <a href="https://proconnect.crisp.help/fr/article/quest-ce-que-lerreur-y500001-4frofp/">centre d'aide</a>.`;
  }
  public code = ErrorCode.NO_IDP;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-y500001-fournisseur-didentite-indisponible-sur-le-rie-4frofp/';
  public illustration = 'access-restricted-error';
  public title = 'Accès impossible';
  public displayContact = false;
}
