import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreFcaBaseException } from './core-fca-base.exception';

export class NoDefaultSiretException extends CoreFcaBaseException {
  static DOCUMENTATION =
    "L'identité retournée ne contient pas de siret valide et nous ne parvenons pas à trouver le siret par défaut du fournisseur d'identité. Veuillez contacter votre fournisseur d'identité.";
  static CODE = ErrorCode.NO_IDP_SIRET;
  static HTTP_STATUS_CODE = HttpStatus.BAD_REQUEST;
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION = 'no default siret from idp';

  public description = NoDefaultSiretException.DOCUMENTATION;
  public illustration = 'access-restricted-error';
  public title = 'Siret invalide';
}
