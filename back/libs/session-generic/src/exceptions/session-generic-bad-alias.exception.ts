/* istanbul ignore file */

// declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description("La Session présente une erreur d'alias")
export class SessionBadAliasException extends SessionGenericBaseException {
  public readonly code = ErrorCode.BAD_SESSION_ALIAS;

  constructor(error: Error) {
    super(error);
    this.message = 'Erreur technique';
  }
}
