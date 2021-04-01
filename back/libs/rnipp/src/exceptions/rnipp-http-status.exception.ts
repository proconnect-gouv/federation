/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description('Impossible de joindre le RNIPP')
export class RnippHttpStatusException extends RnippBaseException {
  public readonly code = ErrorCode.HTTP_STATUS;
  message = 'Une erreur est survenue dans la transmission de votre identité';

  constructor(error) {
    super();
    this.originalError = error;
  }
}
