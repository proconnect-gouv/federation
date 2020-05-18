import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enum';

export class OidcClientProviderDisabledException extends OidcClientBaseException {
  code = ErrorCode.DISABLED_PROVIDER;
}
