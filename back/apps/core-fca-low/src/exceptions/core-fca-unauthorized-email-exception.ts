import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaUnauthorizedEmailException extends CoreFcaBaseException {
  public code = ErrorCode.UNAUTHORIZED_EMAIL;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public documentation = '';

  public error = 'access_denied';
  public error_description =
    'authentication aborted due to a configuration limitation';

  public illustration = 'unauthorized-email-error';
  public title = 'Email non autorisé';
  declare public description: string;
  public displayContact = true;
  declare public contactMessage: string;
  public contactHref: string;

  constructor(
    private spName: string,
    private spContact: string,
    private authorizedFqdns: string[],
  ) {
    super();
    this.description =
      `Vous essayez de vous connecter à ${this.spName}.\n\n` +
      `Réessayez en utilisant votre adresse email professionnelle :\n\n` +
      `✅ ${this.authorizedFqdns.join(', ')}\n` +
      `❌ gmail, yahoo, orange`;
    this.contactMessage = `Si cela ne fonctionne pas, contactez le support utilisateur du service ${this.spName} pour régler le problème.`;
    this.contactHref = `mailto:${this.spContact}`;
  }
}