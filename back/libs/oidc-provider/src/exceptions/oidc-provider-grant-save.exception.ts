/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

@Description('Problème de sauvegarde du grant')
export class OidcProviderGrantSaveException extends OidcProviderBaseException {
  public readonly code = ErrorCode.GRANT_NOT_SAVED;
  message = 'Impossible de générer le grant lors du finishInteraction';
}
