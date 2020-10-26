/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientRuntimeException extends OidcClientBaseException {
  code = ErrorCode.RUNTIME;
}
