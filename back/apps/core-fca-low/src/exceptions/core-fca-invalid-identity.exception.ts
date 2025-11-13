import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaInvalidIdentityException extends CoreFcaBaseException {
  public code = ErrorCode.INVALID_IDENTITY;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public description =
    'Nous ne pouvons pas vérifier votre identité auprès de la source officielle : certains éléments ont un format invalide. Nous vous conseillons de contacter le service informatique de votre organisation ou ministère.';
  public displayContact = true;
  public contactMessage = "Signaler l'erreur au service informatique concerné.";

  constructor(
    public contact: string,
    public validationConstraints = 'Les champs en erreur ne sont pas connus.',
    public validationTarget: string = '',
  ) {
    super();

    const emailBody = encodeURIComponent(`Bonjour,

Voici une erreur remontée par ProConnect suite à une tentative de connexion infructueuse.

${this.validationConstraints}

Voici l'identité telle que reçue par ProConnect :

${this.validationTarget}

ProConnect a vérifié que l'erreur ne venait pas de leur côté.

Merci de corriger mes informations d'identité afin que ProConnect reconnaisse mon identité et que je puisse me connecter.

Cordialement,
`);
    const emailSubject = encodeURIComponent(
      'Mise à jour de mon profil pour compatibilité ProConnect',
    );
    const emailAddress = encodeURIComponent(this.contact);

    this.contactHref = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;
  }
}
