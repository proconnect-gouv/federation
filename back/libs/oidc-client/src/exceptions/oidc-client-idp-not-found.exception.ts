import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIdpNotFoundException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_PROVIDER;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
