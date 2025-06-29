import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class InvalidChecktokenRequestException extends CoreBaseException {
  public code = ErrorCode.IDENTITY_CHECK_TOKEN;
  public documentation =
    "La requête reçue pour vérifier le token n'est pas valide. Des paramètres obligatoires sont manquants ou au mauvais format.";

  public error = 'invalid_request';
  public error_description = 'Required parameter missing or invalid.';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'Core.exceptions.coreInvalidCheckTokenRequest';
}
