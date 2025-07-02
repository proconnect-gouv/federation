import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderRuntimeException extends OidcProviderBaseException {
  public code = ErrorCode.RUNTIME_ERROR;
  public ui = 'OidcProvider.exceptions.RuntimeException';
}
