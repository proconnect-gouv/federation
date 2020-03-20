import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class OidcProviderBindingException extends OidcProviderBaseException {
  public readonly code = ErrorCode.BINDING_PROVIDER;
}
