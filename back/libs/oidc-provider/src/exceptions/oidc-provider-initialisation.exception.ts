import { ErrorCode } from '../enums';
import { OidcProviderBaseRenderedException } from './oidc-provider-base-rendered.exception';

export class OidcProviderInitialisationException extends OidcProviderBaseRenderedException {
  public code = ErrorCode.INIT_PROVIDER;
  public documentation =
    "Problème lors de l'initialisation de la plateforme lié au wrapper oidc-provider. La plateforme ne fonctionne pas, contacter en urgence le support N3.";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'OidcProvider.exceptions.oidcProviderInitialisation';
}
