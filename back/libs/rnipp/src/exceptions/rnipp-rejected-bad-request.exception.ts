/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

@Description(
  'Erreur de communication avec le RNIPP (demande rejetée par le RNIPP)',
)
export class RnippRejectedBadRequestException extends RnippBaseException {
  public readonly code = ErrorCode.REJECTED_BAD_REQUEST;
  message = 'Erreur technique';
}
