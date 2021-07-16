/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

@Description(
  "Impossible de récupérer l'url de déconnexion du FI, probablement dû à une erreur de configuration du FI. Contacter le support N3",
)
export class OidcClientGetEndSessionUrlException extends OidcClientBaseException {
  code = ErrorCode.GET_END_SESSION_URL;

  constructor() {
    super('Une erreur technique est survenue, veuillez contacter le support.');
  }
}
