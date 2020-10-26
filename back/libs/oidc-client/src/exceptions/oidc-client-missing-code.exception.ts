/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientMissingCodeException extends OidcClientBaseException {
  code = ErrorCode.MISSING_CODE;
}
