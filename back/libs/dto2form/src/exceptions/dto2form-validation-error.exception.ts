import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { FieldErrorsInterface } from '../interfaces';
import { Dto2FormBaseException } from './dto2form-base.exception';

export class Dto2FormValidationErrorException extends Dto2FormBaseException {
  public documentation =
    'Les données soumises dans le formulaire ne satisfont pas les règles de validation.';
  public code = ErrorCode.VALIDATION_ERROR;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.UNPROCESSABLE_ENTITY;
  public ui = 'Dto2form.exceptions.dto2formValidationError';

  constructor(validationErrors: FieldErrorsInterface[]) {
    super();
    this.log = JSON.stringify(validationErrors);
  }
}
