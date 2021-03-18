/* istanbul ignore file */

// Declarative code
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
import { Description } from '@fc/error';
@Description('Le FI est désactivé')
export class OidcClientProviderDisabledException extends OidcClientBaseException {
  code = ErrorCode.DISABLED_PROVIDER;
  message = "La connexion via ce fournisseur d'identité est désactivée";
}
