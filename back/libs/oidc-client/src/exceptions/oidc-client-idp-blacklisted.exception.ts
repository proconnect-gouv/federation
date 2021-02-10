/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientIdpBlacklistedException extends OidcClientBaseException {
  code = ErrorCode.PROVIDER_BLACKLISTED_OR_NON_WHITELISTED;

  constructor(spId: string, idpId: string) {
    super();
    this.message = `the identity provider id:${idpId} is blacklisted by service provider id:${spId}`;
  }
}
