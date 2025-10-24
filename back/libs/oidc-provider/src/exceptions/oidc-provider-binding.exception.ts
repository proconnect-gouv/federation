import { ErrorCode } from '../enums';
import { OidcProviderBaseException } from './oidc-provider-base.exception';

export class OidcProviderBindingException extends OidcProviderBaseException {
  public code = ErrorCode.BINDING_PROVIDER;
  public documentation =
    "Problème lors de l'initialisation de la plateforme lié au wrapper oidc-provider. La plateforme ne fonctionne pas, contacter en urgence le support N3.";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcProvider.exceptions.oidcProviderBinding';
}
