/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description('Erreur de communication avec le RNIPP (pas de réponse du RNIPP)')
export class RnippTimeoutException extends RnippBaseException {
  public readonly code = ErrorCode.REQUEST_TIMEOUT;
  message = 'Erreur technique';

  constructor(error) {
    super();
    this.originalError = error;
  }
}
