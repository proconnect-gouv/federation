import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
import { Loggable } from '@fc/error';
// declarative code
// istanbul ignore next line
@Loggable(false)
export class OidcProviderInteractionNotFoundException extends OidcProviderBaseException {
  public readonly code = ErrorCode.INTERACTION_NOT_FOUND;
}
