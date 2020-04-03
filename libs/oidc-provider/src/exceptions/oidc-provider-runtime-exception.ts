import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class OidcProviderRuntimeException extends OidcProviderBaseException {
  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message + '\n' + error.error_description;
  }
  public readonly code = ErrorCode.RUNTIME;
}
