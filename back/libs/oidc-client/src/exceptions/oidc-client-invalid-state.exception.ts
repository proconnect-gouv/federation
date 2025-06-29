import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientInvalidStateException extends OidcClientBaseException {
  public code = ErrorCode.INVALID_STATE;
  public documentation =
    "La requête reçue au retour du FI n'est pas valide (state invalide), recommencer la cinématique depuis le FS. si le problème persiste, contacter le support N3";
  static ERROR = 'invalid_request';
  static ERROR_DESCRIPTION = 'invalid state parameter';
  public http_status_code = HttpStatus.FORBIDDEN;
  public ui = 'OidcClient.exceptions.oidcClientInvalidState';
}
