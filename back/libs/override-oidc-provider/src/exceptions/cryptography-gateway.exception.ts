import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CryptographyBaseException } from './cryptography-base.exception';

export class CryptographyGatewayException extends CryptographyBaseException {
  public code = ErrorCode.GATEWAY;
  public documentation =
    "Il y a un problème de communication avec le HSM. L'application est inutilisable pour tous les usagers. Contacter le support N3 en urgence.";
  static ERROR = 'temporarily_unavailable';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.BAD_GATEWAY;
  public ui = 'OverrideOidcProvider.exceptions.cryptographyGateway';
}
