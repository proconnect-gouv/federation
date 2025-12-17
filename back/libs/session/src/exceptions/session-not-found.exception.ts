import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { SessionBaseException } from './session-base.exception';

export class SessionNotFoundException extends SessionBaseException {
  public code = ErrorCode.NOT_FOUND;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public crispLink =
    'https://proconnect.crisp.help/fr/article/code-190001-acces-non-autorise-401-18sba6b/';
  public http_status_code = HttpStatus.UNAUTHORIZED;
}
