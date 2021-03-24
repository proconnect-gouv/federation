import { Description } from '@fc/error';
import { MailerBaseException } from './mailer-base.exception';

@Description(
  `Un utilisateur s'est connecté à FranceConnect, il recoit un mail lui notifiant une nouvelle connection à un de ses comptes. Si l'envoi de cet mail de notification échoue, cette exception sera levée.`,
)
export class MailerNotificationConnectException extends MailerBaseException {
  code = 2;
  message = 'Bad or Missing connection notification email parameters';
}
