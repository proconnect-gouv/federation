import { BaseException } from '@fc/base-exception';

import { ErrorCode } from '../enums';

export class OidcProviderRuntimeException extends BaseException {
  public code = ErrorCode.RUNTIME_ERROR;
  public ui = 'OidcProvider.exceptions.RuntimeException';
  public scope = 3;
  public error = 'server_error';
  public error_description = 'something bad happened';
}
