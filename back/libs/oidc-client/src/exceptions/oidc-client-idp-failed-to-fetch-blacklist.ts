/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientFailedToFetchBlacklist extends OidcClientBaseException {
  code = ErrorCode.BLACLIST_OR_WHITELIST_CHECK_FAILED;
}
