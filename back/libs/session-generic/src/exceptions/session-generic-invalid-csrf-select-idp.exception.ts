/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description(
  "L'utilisateur a lancé deux cinématiques en parallèle dans différents onglet. L'utilisateur doit redémarrer sa cinématique. Si cela persiste, contacter le support N3",
)
export class SessionGenericInvalidCsrfSelectIdpException extends SessionGenericBaseException {
  public readonly code = ErrorCode.INVALID_CSRF_SELECT_IDP;

  constructor(error?: Error) {
    super(error);
    this.message =
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.';
  }
}
