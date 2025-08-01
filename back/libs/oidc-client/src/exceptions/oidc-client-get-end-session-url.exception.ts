import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientGetEndSessionUrlException extends OidcClientBaseException {
  public code = ErrorCode.GET_END_SESSION_URL;
  public documentation =
    "Impossible de récupérer l'url de déconnexion du FI, probablement dû à une erreur de configuration du FI. Contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcClient.exceptions.oidcClientGetEndSessionUrl';
}
