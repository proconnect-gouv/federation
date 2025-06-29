import { ErrorCode } from '../enums';
import { ChecktokenBaseException } from './checktoken-base.exception';

export class ChecktokenInvalidEncodingException extends ChecktokenBaseException {
  public code = ErrorCode.CHECKTOKEN_INVALID_ENCODING;
  public documentation =
    "Un problème est survenu lors de l'appel au checktoken, le core est injoignable";
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'DataProviderAdapterCore.exceptions.checktokenInvalidEncoding';
}
