import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaAgentNotFromPublicServiceException extends CoreFcaBaseException {
  static DOCUMENTATION =
    "L'utilisateur renseigné n'est pas reconnu comme dépendant du service public";
  static CODE = ErrorCode.AGENT_NOT_FOUND;
  static HTTP_STATUS_CODE = HttpStatus.BAD_REQUEST;

  static ERROR = 'access_denied';
  static ERROR_DESCRIPTION = 'authentication aborted due to invalid identity';

  public illustration = 'access-restricted-error';
  public title = 'Email non autorisé';
  public description =
    "L'accès à ce site est limité aux agentes et agents possédant une adresse email d'une administration publique.";

  public displayContact = true;
  public contactMessage =
    'Si cette situation vous paraît inhabituelle, vous pouvez nous signaler l’erreur.';
}
