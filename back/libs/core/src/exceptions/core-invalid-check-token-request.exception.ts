/* istanbul ignore file */

// Declarative code
import { HttpStatus } from '@nestjs/common';

import { Description } from '@fc/exceptions-deprecated';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

@Description(
  "La requête reçue pour vérifier le token n'est pas valide. Des paramètres obligatoires sont manquants ou au mauvais format.",
)
export class InvalidChecktokenRequestException extends CoreBaseException {
  code = ErrorCode.IDENTITY_CHECK_TOKEN;
  message = 'Required parameter missing or invalid.';
  public readonly httpStatusCode = HttpStatus.BAD_REQUEST;
  public readonly error = 'invalid_request';

  static ERROR = 'invalid_request';
  static ERROR_DESCRIPTION = 'required parameter missing or invalid';
}
