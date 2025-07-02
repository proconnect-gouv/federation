import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { DataProviderAdapterMongoBaseException } from './data-provider-adapter-mongo-base.exception';

export class DataProviderInvalidCredentialsException extends DataProviderAdapterMongoBaseException {
  public code = ErrorCode.INVALID_CREDENTIALS;
  public documentation =
    "Le client_id ou le client_secret ne correspond pas à celui d'un fournisseur de données.";
  public error = 'invalid_client';
  public error_description = 'Client authentication failed.';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  public ui =
    'DataProviderAdapterMongo.exceptions.dataProviderInvalidCredentials';
}
