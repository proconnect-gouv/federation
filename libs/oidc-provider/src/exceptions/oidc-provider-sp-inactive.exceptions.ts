import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class OidcProviderSPInactiveException extends OidcProviderBaseException {
  public readonly code = ErrorCode.SP_INACTIVE;
}
