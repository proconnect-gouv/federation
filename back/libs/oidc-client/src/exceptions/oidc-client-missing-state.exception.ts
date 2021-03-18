/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
@Description(
  "La requête reçue au retour du FI n'est pas valide (pas de code de state), problème probable avec le FI, contacter le service technique",
)
export class OidcClientMissingStateException extends OidcClientBaseException {
  code = ErrorCode.MISSING_STATE;
  message = 'Erreur technique';
}
