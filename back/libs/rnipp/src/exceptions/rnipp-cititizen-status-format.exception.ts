/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description("Erreur technique lors de l'appel RNIPP, contacter le support N3")
export class RnippCitizenStatusFormatException extends RnippBaseException {
  public readonly code = ErrorCode.CITIZEN_STATUS_FORMAT;

  constructor() {
    super('Une erreur technique est survenue, veuillez contacter le support.');
  }
}
