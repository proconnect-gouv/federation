/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description(
  "Erreur technique lors de l'appel RNIPP, contacter le service technique",
)
export class RnippCitizenStatusFormatException extends RnippBaseException {
  public readonly code = ErrorCode.CITIZEN_STATUS_FORMAT;
  message = 'Erreur technique';

  constructor(error) {
    super();
    this.originalError = error;
  }
}
