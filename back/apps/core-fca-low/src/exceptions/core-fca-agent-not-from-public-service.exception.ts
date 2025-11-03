import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class CoreFcaAgentNotFromPublicServiceException extends CoreFcaBaseException {
  public documentation =
    "L'utilisateur renseigné n'est pas reconnu comme dépendant du service public";
  public code = ErrorCode.AGENT_NOT_FOUND;
  public http_status_code = HttpStatus.BAD_REQUEST;

  public error = 'access_denied';
  public error_description = 'authentication aborted due to invalid identity';

  public illustration = 'access-restricted-error';
  public title = 'Email non autorisé';
  public description =
    "L'accès à ce site est limité aux agentes et agents représentant officiellement une administration publique. Le SIRET associé à votre organisation correspond à une structure de droit privé et ne permet donc pas l’accès.";

  public displayContact = true;
  public contactMessage =
    'Si cette situation vous paraît inhabituelle, vous pouvez nous signaler l’erreur.';
}
