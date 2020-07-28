/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientMissingStateException extends OidcClientBaseException {
  code = ErrorCode.MISSING_STATE;
}
