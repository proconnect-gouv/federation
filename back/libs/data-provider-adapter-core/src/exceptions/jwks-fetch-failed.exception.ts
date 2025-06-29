import { ErrorCode } from '../enums';
import { ChecktokenBaseException } from './checktoken-base.exception';

export class JwksFetchFailedException extends ChecktokenBaseException {
  public code = ErrorCode.JWKS_FETCH_FAILED_EXCEPTION;
  public documentation =
    'Impossible pour le fournisseur de données de joindre le JWKS du core';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'DataProviderAdapterCore.exceptions.jwksFetchFailed';
}
