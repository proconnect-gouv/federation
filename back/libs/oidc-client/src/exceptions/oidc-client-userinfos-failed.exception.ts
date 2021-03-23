/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientUserinfosFailedException extends OidcClientBaseException {
  code = ErrorCode.USERINFOS_FAILED;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
