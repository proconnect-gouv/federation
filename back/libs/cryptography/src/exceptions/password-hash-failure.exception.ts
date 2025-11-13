import { ErrorCode } from '../enums';
import { CryptographyBaseException } from './cryptography-base.exception';

export class PasswordHashFailure extends CryptographyBaseException {
  public code = ErrorCode.PASSWORD_HASH_FAILURE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
