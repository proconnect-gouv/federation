import { ErrorCode } from '../enums';
import { CryptographyBaseException } from './cryptography-base.exception';

export class PasswordHashFailure extends CryptographyBaseException {
  public code = ErrorCode.PASSWORD_HASH_FAILURE;
  public documentation =
    "Une erreur est survenue lors de la vérification d'un mot de passe. Contacter le support N3.";
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Cryptography.exceptions.passwordHashFailure';
}
