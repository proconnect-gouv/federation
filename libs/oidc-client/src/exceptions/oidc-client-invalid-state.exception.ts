/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientInvalidStateException extends OidcClientBaseException {
  code = ErrorCode.INVALID_STATE;
}
