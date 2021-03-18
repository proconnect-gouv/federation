/* istanbul ignore file */

// Declarative code
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';
import { Description, Loggable } from '@fc/error';
// declarative code
// istanbul ignore next line
@Loggable(false)
@Description(
  "La cinématique n'a pas été retrouvée, recommencer la cinématique depuis le FS",
)
export class OidcProviderInteractionNotFoundException extends OidcProviderBaseException {
  public readonly code = ErrorCode.INTERACTION_NOT_FOUND;
  message = 'Erreur technique, recommenez la cinématique';
}
