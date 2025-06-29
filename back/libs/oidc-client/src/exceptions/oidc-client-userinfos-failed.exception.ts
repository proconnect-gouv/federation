import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { OidcClientBaseException } from './oidc-client-base.exception';

export class OidcClientUserinfosFailedException extends OidcClientBaseException {
  public code = ErrorCode.USERINFOS_FAILED;
  public documentation =
    "Une erreur est survenue lors de la récupération des données d'identité aurès du FI. Recommencer la cinématique depuis le FS. Si le problème persiste, contacter le support N3";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_GATEWAY;
  public ui = 'OidcClient.exceptions.oidcClientUserinfosFailed';
}
