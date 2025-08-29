import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaUnauthorizedEmailException extends CoreFcaBaseException {
  constructor(
    private spName: string,
    private spContact: string,
    private authorizedFqdns: string[],
  ) {
    super();
  }

  public code = ErrorCode.UNAUTHORIZED_EMAIL;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public documentation = '';

  public error = 'access_denied';
  public error_description =
    'authentication aborted due to a configuration limitation';

  public illustration = 'unauthorized-email-error';
  public title = 'Email non autorisé';
  public description =
    `Vous essayez de vous connecter à ${this.spName}.\n\n` +
    `Réessayez en utilisant votre adresse email professionnelle :\n\n` +
    `✅ ${this.authorizedFqdns.join(', ')}\n` +
    `❌ gmail, yahoo, orange`;
  public displayContact = true;
  public contactMessage = `Si cela ne fonctionne pas, contactez le support utilisateur du service ${this.spName} pour régler le problème.`;

  public contactHref = `mailto:${this.spContact}`;
}
