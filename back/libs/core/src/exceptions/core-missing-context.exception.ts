import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreMissingContextException extends CoreBaseException {
  public code = ErrorCode.MISSING_CONTEXT;
  public documentation =
    "La requête HTTP n'est pas valide, FranceConnect+ n'a pas pu la traiter car il manque des élements obligatoires ( headers, ... ). Cette erreur ne devrait pas se produire, contacter le service technique";
  public error = 'invalid_request';
  public error_description = 'mandatory parameter missing';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'Core.exceptions.coreMissingContext';

  constructor(param: string) {
    super();
    this.log = `${this.error_description}: ${param}`;
  }
}
