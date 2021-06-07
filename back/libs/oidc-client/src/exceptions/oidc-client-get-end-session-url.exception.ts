/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientGetEndSessionUrlException extends OidcClientBaseException {
  code = ErrorCode.GET_END_SESSION_URL;

  constructor(error) {
    super(error);
  }
}
