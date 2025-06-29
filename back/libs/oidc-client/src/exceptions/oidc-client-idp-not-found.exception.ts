import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIdpNotFoundException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_PROVIDER;
  public documentation =
    "Le FI n'existe pas, si le problème persiste, contacter le support N3";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcClient.exceptions.oidcClientIdpNotFound';
}
