/* istanbul ignore file */

// Declarative code
import { Loggable, Trackable, Description } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Loggable(false)
@Trackable()
@Description("Demande identifiée avec le nom d'usage uniquement")
export class RnippFoundOnlyWithMaritalNameException extends RnippBaseException {
  public readonly code = ErrorCode.FOUND_ONLY_WITH_MARITAL_NAME;
  message = 'Une erreur est survenue dans la transmission de votre identité';
}
