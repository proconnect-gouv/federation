/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
@Description(
  "La requête reçue au retour du FI n'est pas valide (pas de code d'autorisation), recommencer la cinématique depuis le FS",
)
export class OidcClientMissingCodeException extends OidcClientBaseException {
  code = ErrorCode.MISSING_CODE;
  message = 'Erreur technique, recommencez votre cinématique';
}
