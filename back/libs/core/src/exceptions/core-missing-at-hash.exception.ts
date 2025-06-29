import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { CoreBaseException } from './core-base.exception';

export class CoreMissingAtHashException extends CoreBaseException {
  public code = ErrorCode.MISSING_AT_HASH;
  public documentation =
    "Le claim at_hash n'a pas été trouvé dans l'id_token_hint lors du logout";
  static ERROR = 'invalid_request';
  static ERROR_DESCRIPTION = 'Core.exceptions.coreMissingAtHash';
  public http_status_code = HttpStatus.BAD_REQUEST;
  public ui = 'Core.exceptions.coreMissingAtHash';
}
