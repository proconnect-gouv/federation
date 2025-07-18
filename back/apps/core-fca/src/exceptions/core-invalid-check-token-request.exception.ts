import { HttpStatus } from '@nestjs/common';

import { CoreFcaBaseException } from '@fc/core-fca/exceptions/core-fca-base.exception';

import { ErrorCode } from '../enums';

export class InvalidChecktokenRequestException extends CoreFcaBaseException {
  public code = ErrorCode.IDENTITY_CHECK_TOKEN;
  public documentation =
    "La requête reçue pour vérifier le token n'est pas valide. Des paramètres obligatoires sont manquants ou au mauvais format.";

  public error = 'invalid_request';
  public error_description = 'Required parameter missing or invalid.';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'Core.exceptions.coreInvalidCheckTokenRequest';
}
