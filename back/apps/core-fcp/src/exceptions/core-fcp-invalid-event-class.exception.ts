/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { CoreBaseException, ErrorCode } from '@fc/core';
/**
 * @todo do not extend class from @fc/core, use a specific BaseException instead
 * This might be done while removing @fc/core altogether in favor of a light code duplication
 * between core-fcp and core-fca.
 */
@Description(
  'Une méthode de consentement illogique a été configuré pour le FS, typiquement consentement requis + connexion anonyme',
)
export class CoreFcpInvalidEventClassException extends CoreBaseException {
  code = ErrorCode.INVALID_CONSENT_PROCESS;
  message = 'Erreur technique';
}
