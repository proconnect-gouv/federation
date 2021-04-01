/* istanbul ignore file */

// Declarative code
import { Description, Loggable, Trackable } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Loggable(false)
@Trackable()
@Description("L'usager est décedé")
export class RnippDeceasedException extends RnippBaseException {
  public readonly code = ErrorCode.DECEASED;
  message = 'Erreur technique';
}
