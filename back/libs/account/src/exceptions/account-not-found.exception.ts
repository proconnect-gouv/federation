import { ErrorCode } from '../enums';
import { AccountBaseException } from './account-base.exception';

export class AccountNotFoundException extends AccountBaseException {
  public code = ErrorCode.ACCOUNT_NOT_FOUND;
  public documentation = `Le compte demandé basé sur cet identityHash n'existe pas dans la base de donnée`;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'Account.exceptions.accountNotFound';
}
