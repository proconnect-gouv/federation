/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

@Description(
  'Une erreur technique dans le protocole OpenId Connect, contacter le support N3',
)
export class OidcClientRuntimeException extends OidcClientBaseException {
  code = ErrorCode.RUNTIME;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.',
    );
  }
}
