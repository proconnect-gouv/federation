/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
@Description("Problème d'initialisation du wrapper oidc-provider")
export class OidcProviderInitialisationException extends OidcProviderBaseException {
  public readonly code = ErrorCode.INIT_PROVIDER;
}
