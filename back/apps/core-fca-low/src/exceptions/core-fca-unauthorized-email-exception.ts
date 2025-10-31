import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/exceptions/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class CoreFcaUnauthorizedEmailException extends CoreFcaBaseException {
  public code = ErrorCode.UNAUTHORIZED_EMAIL;
  public http_status_code = HttpStatus.BAD_REQUEST;
  public documentation = '';

  public error = 'access_denied';
  public error_description =
    'authentication aborted due to a configuration limitation';

  public illustration = 'unauthorized-email-error';
  public title = 'Email non autorisé';
  public declare description: string;
  public displayContact = true;
  public declare contactMessage: string;

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
    this.contactHref = `mailto:${encodeURIComponent(this.spContact)}`;
  }
}
