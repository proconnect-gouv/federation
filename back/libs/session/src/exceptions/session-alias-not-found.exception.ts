import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionAliasNotFoundException extends SessionBaseException {
  public code = ErrorCode.ALIAS_NOT_FOUND;
  public documentation = "L'alias de la session n'a pas été trouvé.";
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.INTERNAL_SERVER_ERROR;
}
