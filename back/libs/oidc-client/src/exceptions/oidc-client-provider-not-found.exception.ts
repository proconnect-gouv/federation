/* istanbul ignore file */

// Declarative code
import { Description } from '@fc/exceptions';
import { OidcClientBaseException } from './oidc-client-base.exception';
import { ErrorCode } from '../enums';

@Description(
  "Le FI n'existe pas, si le problème persiste, contacter le support N3",
)
export class OidcClientProviderNotFoundException extends OidcClientBaseException {
  code = ErrorCode.MISSING_PROVIDER;

  constructor() {
    super("Ce fournisseur d'identité est inconnu");
  }
}
