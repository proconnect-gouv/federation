/* istanbul ignore file */

// Declarative code
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';

@Description("Problème d'initialisation du wrapper oidc-provider")
export class OidcProviderBindingException extends OidcProviderBaseException {
  public readonly code = ErrorCode.BINDING_PROVIDER;
  message = 'Erreur technique';
}
