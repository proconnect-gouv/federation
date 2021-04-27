/* istanbul ignore file */

// declarative code
import { Description } from '@fc/exceptions';
import { ErrorCode } from '../enums';
import { SessionGenericBaseException } from './session-generic-base.exception';

@Description("La Session n'a pas été trouvée")
export class SessionGenericNotFoundException extends SessionGenericBaseException {
  public readonly code = ErrorCode.NOT_FOUND;

  constructor(moduleName: string) {
    super(moduleName);
    this.message = 'Session not found';
  }
}
