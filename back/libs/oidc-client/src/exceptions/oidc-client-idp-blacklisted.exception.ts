/* istanbul ignore file */

// Declarative code
import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientIdpBlacklistedException extends OidcClientBaseException {
  static CODE = ErrorCode.PROVIDER_BLACKLISTED_OR_NON_WHITELISTED;
  static DOCUMENTATION =
    "Le fournisseur d'identité utilisé par l'usager n'est pas autorisé pour ce FS. Cela peut se produire uniquement lorsque l'on a ajouté le FI dans la blacklist du FS. L'utilisateur doit recommencer sa cinématique. Si le problème persiste, contacter le support N3";
  static HTTP_STATUS_CODE = HttpStatus.FORBIDDEN;
  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  static UI = 'OidcClient.exceptions.oidcClientIdpBlacklisted';
}
