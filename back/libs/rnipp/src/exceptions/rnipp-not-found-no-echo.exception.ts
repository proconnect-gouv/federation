/* istanbul ignore file */

// Declarative code
import { Description, Loggable, Trackable } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Loggable(false)
@Trackable()
@Description("Le RNIPP n'a pas trouvé l'identité fournie")
export class RnippNotFoundNoEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_NO_ECHO;
  message = 'Une erreur est survenue dans la transmission de votre identité';
}
