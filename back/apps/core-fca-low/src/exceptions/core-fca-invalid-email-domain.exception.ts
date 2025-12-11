import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaInvalidEmailDomainException extends CoreFcaBaseException {
  public code = ErrorCode.INVALID_EMAIL_DOMAIN;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  public displayContact = true;
  public contactMessage = "Signaler l'erreur au service informatique concerné.";

  constructor(idpName: string, email: string, contact: string) {
    super();

    const emailDomain = email?.split('@').pop().toLowerCase();

    this.description = `Le domaine « ${emailDomain} » que vous utilisez ne fait pas partie des domaines autorisés pour ${idpName}.`;

    const emailBody = encodeURIComponent(`Bonjour,

Lors d’une tentative de connexion via ProConnect, une erreur m’a été retournée indiquant que le domaine de l’adresse e-mail fourni par mon fournisseur d’identité ${idpName} n’est pas autorisé pour ce fournisseur d’identité.

L’adresse e-mail renvoyée est ${email}.

La liste des domaines autorisés est consultable via le document Grist suivant : https://grist.numerique.gouv.fr/o/proconnect/gNkPzdjPZnv8/ProConnect-Configuration-des-FI-et-FS/p/9

Serait-il possible soit de modifier mon identité afin de renvoyer un domaine e-mail conforme aux exigences de ProConnect, soit de prendre contact avec eux pour demander l’autorisation de ce domaine ?

Je vous remercie par avance pour votre aide.

Cordialement,
`);

    const emailSubject = encodeURIComponent(
      'Mise à jour de mon profil pour compatibilité ProConnect',
    );

    const emailAddress = encodeURIComponent(contact);

    this.contactHref = `mailto:${emailAddress}?subject=${emailSubject}&body=${emailBody}`;
  }
}
