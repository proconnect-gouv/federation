import { ErrorCode } from '../enums';
import { ChecktokenBaseException } from './checktoken-base.exception';

export class ChecktokenInvalidAlgorithmException extends ChecktokenBaseException {
  public code = ErrorCode.CHECKTOKEN_INVALID_ALGORYTHM;
  public documentation =
    "Un problème est survenu lors de l'appel au checktoken";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'DataProviderAdapterCore.exceptions.checktokenInvalidAlgorithm';
}
