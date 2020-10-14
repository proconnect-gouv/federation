import { Description } from '@fc/error';
import { AccountBaseException } from './account-base.exception';

@Description(
  `Un utilisateur a demandé à ce que sa connexion via franceConnect soit désactivée. La connexion via ses identifiants est donc impossible désormais. Réactivation du compte nécessaire pour pouvoir procéder à une nouvelle connexion via ce compte.`,
)
export class AccountBlockedException extends AccountBaseException {
  code = 1;
  message = 'Account blocked';
}
