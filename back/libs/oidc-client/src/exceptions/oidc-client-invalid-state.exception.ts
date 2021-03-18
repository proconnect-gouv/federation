/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description(
  "La requête reçue au retour du FI n'est pas valide (state invalide), recommencer la cinématique depuis le FS",
)
export class OidcClientInvalidStateException extends OidcClientBaseException {
  code = ErrorCode.INVALID_STATE;
  message = 'Erreur technique, recommencez votre cinématique';
}
