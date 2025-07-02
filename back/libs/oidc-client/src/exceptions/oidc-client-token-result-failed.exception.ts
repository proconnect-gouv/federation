import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientTokenResultFailedException extends OidcClientBaseException {
  public code = ErrorCode.TOKEN_RESULT_FAILED;
  public documentation =
    "Une erreur est survenu lors de la récupération des jetons auprès du fournisseur d'identité. Les données renvoyées lors de l'appel au /token du FI sont incorrectes et n'ont pas pu être validées. Il faut recommencer la cinématique. Si le problème persiste, contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
  public ui = 'OidcClient.exceptions.oidcClientTokenResultFailed';
}
