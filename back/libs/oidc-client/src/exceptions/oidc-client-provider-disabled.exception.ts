/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
@Description('Le FI est désactivé')
export class OidcClientProviderDisabledException extends OidcClientBaseException {
  code = ErrorCode.DISABLED_PROVIDER;
  message = "La connexion via ce fournisseur d'identité est désactivée";
}
