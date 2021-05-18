/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { MailerBaseException } from './mailer-base.exception';

@Description(
  `Un utilisateur s'est connecté à FranceConnect, il devrait recevoir un mail lui notifiant une nouvelle connection à un de ses comptes. Si le template de cet email n'est pas trouvé, cette exception sera levée`,
)
export class TemplateNotFoundException extends MailerBaseException {
  code = 3;
  message = 'No template found';
}
