/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
@Description(
  "La requête reçue au retour du FI n'est pas valide (pas de code d'autorisation), recommencer la cinématique depuis le FS. Si le problème persiste, contacter le support N3",
)
export class OidcClientMissingCodeException extends OidcClientBaseException {
  code = ErrorCode.MISSING_CODE;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
    );
  }
}
