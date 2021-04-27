/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { MailerBaseException } from './mailer-base.exception';

@Description(
  `Un utilisateur s'est connecté à FranceConnect, il recoit un mail lui notifiant une nouvelle connection à un de ses comptes. Si l'email de cet utilisateur n'est pas présent cette exception sera levée`,
)
export class NoEmailException extends MailerBaseException {
  code = 1;
  message = 'No email defined';
}
