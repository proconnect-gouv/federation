import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

export class OidcClientProviderDisabledException extends OidcClientBaseException {
  code = ErrorCode.DISABLED_PROVIDER;
}
