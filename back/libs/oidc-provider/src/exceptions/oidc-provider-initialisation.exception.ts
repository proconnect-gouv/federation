import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderInitialisationException extends OidcProviderBaseException {
  public code = ErrorCode.INIT_PROVIDER;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
