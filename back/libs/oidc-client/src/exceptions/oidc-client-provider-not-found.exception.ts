/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/error';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';
@Description("Le FI n'existe pas")
export class OidcClientProviderNotFoundException extends OidcClientBaseException {
  code = ErrorCode.MISSING_PROVIDER;
  message = "Ce fournisseur d'identité est inconnu";
}
