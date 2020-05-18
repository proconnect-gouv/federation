import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enum';

export class OidcClientProviderNotFoundException extends OidcClientBaseException {
  code = ErrorCode.MISSING_PROVIDER;
}
