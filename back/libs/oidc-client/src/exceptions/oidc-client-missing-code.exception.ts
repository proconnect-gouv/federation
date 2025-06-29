import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientMissingCodeException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_CODE;
  public documentation =
    "La requête reçue au retour du FI n'est pas valide (pas de code d'autorisation), recommencer la cinématique depuis le FS. Si le problème persiste, contacter le support N3";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_REQUEST;
  static UI = 'OidcClient.exceptions.oidcClientMissingCode';
}
