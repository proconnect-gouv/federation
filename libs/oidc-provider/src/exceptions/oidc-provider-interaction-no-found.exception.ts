import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
// declarative code
// istanbul ignore next line
export class OidcProviderInteractionNotFoundException extends OidcProviderBaseException {
  public readonly code = ErrorCode.INTERACTION_NOT_FOUND;
}
