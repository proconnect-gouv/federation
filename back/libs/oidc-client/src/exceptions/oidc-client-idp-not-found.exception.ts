import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIdpNotFoundException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_PROVIDER;
  public error = 'server_error';
  public error_description =
    'The specified identity provider could not be found.';
}
