/* istanbul ignore file */

// Declarative code
import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreMissingAuthenticationEmailException extends CoreBaseException {
  code = ErrorCode.MISSING_AUTHENTICATION_EMAIL;
  message = 'No authenticationEmail feature handler set in database';
}
