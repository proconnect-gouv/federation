import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_FAILED;
  public documentation =
    "La requête reçue au retour du FI n'est pas valide (le code d'autorisation est présent mais n'est pas reconnu par le FI), recommencer la cinématique depuis le FS. Si le problème persiste, contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_GATEWAY;
  public ui = 'OidcClient.exceptions.oidcClientTokenFailed';
}
