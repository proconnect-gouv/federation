/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

@Description(
  "La requête reçue au retour du FI n'est pas valide (pas de state), problème probable avec le FI, contacter le support N3",
)
export class OidcClientMissingStateException extends OidcClientBaseException {
  code = ErrorCode.MISSING_STATE;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
    );
  }
}
