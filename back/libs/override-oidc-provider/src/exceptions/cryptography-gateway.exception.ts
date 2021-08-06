import { CryptographyBaseException } from './cryptography-base.exception';

import { Description } from '@fc/exceptions';

import { ErrorCode } from '../enums';

/* istanbul ignore file */

// Declarative code
@Description(
  "Il y a un problème de communication avec le HSM. L'application est inutilisable pour tous les usagers. Contacter le support N3 en urgence.",
)
export class CryptographyGatewayException extends CryptographyBaseException {
  public readonly code = ErrorCode.GATEWAY;

  constructor() {
    super('Une erreur technique est survenue, veuillez contacter le support.');
  }
}
