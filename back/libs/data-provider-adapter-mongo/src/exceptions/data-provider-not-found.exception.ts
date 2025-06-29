import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { DataProviderAdapterMongoBaseException } from './data-provider-adapter-mongo-base.exception';

export class DataProviderNotFoundException extends DataProviderAdapterMongoBaseException {
  public code = ErrorCode.DATA_PROVIDER_NOT_FOUND;
  public documentation =
    'Aucun fournisseur de données trouvé avec ce client_id.';
  static ERROR = 'invalid_client';
  static ERROR_DESCRIPTION = 'Client authentication failed.';
  public http_status_code = HttpStatus.UNAUTHORIZED;
  static UI = 'DataProviderAdapterMongo.exceptions.dataProviderNotFound';
}
