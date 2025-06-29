import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { FieldErrorsInterface } from '../interfaces';
import { Dto2FormBaseException } from './dto2form-base.exception';

export class Dto2FormValidationErrorException extends Dto2FormBaseException {
  public documentation =
    'Les données soumises dans le formulaire ne satisfont pas les règles de validation.';
  public code = ErrorCode.VALIDATION_ERROR;
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.UNPROCESSABLE_ENTITY;
  static UI = 'Dto2form.exceptions.dto2formValidationError';

  constructor(validationErrors: FieldErrorsInterface[]) {
    super();
    this.log = JSON.stringify(validationErrors);
  }
}
