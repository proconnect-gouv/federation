import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaUnauthorizedEmailException extends CoreFcaBaseException {
  public code = ErrorCode.UNAUTHORIZED_EMAIL;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'access_denied';
  public error_description =
    'authentication aborted due to a configuration limitation';

  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-500025-acces-refuse-au-service-uniforces-x40x12/';

  public illustration = 'unauthorized-email-error';
  public title = 'Email non autorisé';
  public displayContact = true;

  constructor(
    spName: string,
    spContact: string,
    authorizedFqdns: string[] = [],
  ) {
    super();
    this.description = `Vous essayez de vous connecter à ${spName}.

Réessayez en utilisant votre adresse email professionnelle :

✅ ${authorizedFqdns.join(', ')}
❌ gmail, yahoo, orange`;

    this.contactMessage = `Si cela ne fonctionne pas, contactez le support utilisateur du service ${spName} pour régler le problème.`;
    this.contactHref = `mailto:${encodeURIComponent(spContact)}`;
  }
}
