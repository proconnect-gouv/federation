import { ErrorCode } from '../enums';
import { Dto2FormBaseException } from './dto2form-base.exception';

export class Dto2FormInvalidFormException extends Dto2FormBaseException {
  public code = ErrorCode.INVALID_FORM;
  public documentation = 'La classe cible n\'est pas de type "FormDtoBase".';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Dto2form.exceptions.dto2formInvalidForm';
}
