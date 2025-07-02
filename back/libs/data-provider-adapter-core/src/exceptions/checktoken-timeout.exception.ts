import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { ChecktokenBaseException } from './checktoken-base.exception';

export class ChecktokenTimeoutException extends ChecktokenBaseException {
  public code = ErrorCode.CHECKTOKEN_TIMEOUT_EXCEPTION;
  public documentation =
    "Un problème est survenu lors de l'appel au checktoken, le core est injoignable";
  public error = 'temporarily_unavailable';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public http_status_code = HttpStatus.REQUEST_TIMEOUT;
  public ui = 'DataProviderAdapterCore.exceptions.checktokenTimeout';
}
