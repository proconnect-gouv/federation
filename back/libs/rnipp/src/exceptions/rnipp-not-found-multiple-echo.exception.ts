/* istanbul ignore file */

// Declarative code
import { Description, Loggable, Trackable } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
@Loggable(false)
@Trackable()
@Description("Le RNIPP a trouvé plusieurs echos pour l'identité fournie")
export class RnippNotFoundMultipleEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_MULTIPLE_ECHO;
  message = 'Une erreur est survenue dans la transmission de votre identité';
}
