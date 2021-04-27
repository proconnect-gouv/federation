/* istanbul ignore file */

// declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description("La Session n'est pas valide'")
export class SessionGenericInvalidSessionException extends SessionGenericBaseException {
  public readonly code = ErrorCode.INVALID_SESSION;

  constructor(e: Error) {
    super(e);
    this.message = 'Erreur technique';
  }
}
