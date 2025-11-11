import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { FlowStepsBaseException } from './flow-steps-base.exception';

export class UnexpectedNavigationException extends FlowStepsBaseException {
  public code = ErrorCode.UNEXPECTED_NAVIGATION;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.BAD_REQUEST;
}
