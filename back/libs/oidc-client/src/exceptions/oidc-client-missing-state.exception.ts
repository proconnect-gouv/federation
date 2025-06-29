import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientMissingStateException extends OidcClientBaseException {
  public code = ErrorCode.MISSING_STATE;
  public documentation =
    "La requête reçue au retour du FI n'est pas valide (pas de state), problème probable avec le FI, contacter le support N3";
  static ERROR = 'invalid_request';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'OidcClient.exceptions.oidcClientMissingState';
}
