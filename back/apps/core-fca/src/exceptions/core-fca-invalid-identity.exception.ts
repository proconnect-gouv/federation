/* istanbul ignore file */

// Declarative code
import { HttpStatus } from '@nestjs/common';

import { CoreBaseException, ErrorCode } from '@fc/core';
import { Description } from '@fc/exceptions';

@Description("L'utilisateur doit être rattaché à un service public.")
export class CoreFcaInvalidIdentityException extends CoreBaseException {
  code = ErrorCode.INVALID_IDENTITY;
  public readonly httpStatusCode = HttpStatus.BAD_REQUEST;

  constructor() {
    super(
      'Une erreur technique est survenue, fermez l’onglet de votre navigateur et reconnectez-vous',
    );
  }
}
