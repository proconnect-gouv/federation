/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcProviderBaseException } from './oidc-provider-base.exception';
import { ErrorCode } from '../enums';

@Description('Problème de sauvegarde du grant. Contacter le support N3')
export class OidcProviderGrantSaveException extends OidcProviderBaseException {
  public readonly code = ErrorCode.GRANT_NOT_SAVED;
  message = 'Une erreur technique est survenue, veuillez contacter le support.';
}
