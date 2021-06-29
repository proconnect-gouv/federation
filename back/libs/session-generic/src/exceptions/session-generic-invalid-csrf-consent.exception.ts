/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description(
  'La page de consentement a été appelée sans avoir validé le jeton CSRF (redirection vers le FS)',
)
export class SessionGenericInvalidCsrfConsentException extends SessionGenericBaseException {
  public readonly code = ErrorCode.INVALID_CSRF_CONSENT;

  constructor(error?: Error) {
    super(error);
    this.message =
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous.';
  }
}
