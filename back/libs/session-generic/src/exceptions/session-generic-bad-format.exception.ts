/* istanbul ignore file */

// declarative code
import { Description } from '@fc/error/decorator';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description('La Session présente une erreur de format de données')
export class SessionBadFormatException extends SessionGenericBaseException {
  public readonly code = ErrorCode.BAD_SESSION_FORMAT;

  constructor(error) {
    super(error);
    this.message = error;
  }
}
