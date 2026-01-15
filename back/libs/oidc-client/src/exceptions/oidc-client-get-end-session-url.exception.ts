import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientGetEndSessionUrlException extends OidcClientBaseException {
  public code = ErrorCode.GET_END_SESSION_URL;
  public error = 'server_error';
  public error_description =
    'Could not retrieve the end session URL from the identity provider.';
}
