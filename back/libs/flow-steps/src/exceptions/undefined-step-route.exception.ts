import { HttpStatus } from '@nestjs/common';

import { ErrorCode } from '../enums';
import { FlowStepsBaseException } from './flow-steps-base.exception';

export class UndefinedStepRouteException extends FlowStepsBaseException {
  public code = ErrorCode.UNDEFINED_STEP_ROUTE;
  public error = 'access_denied';
  public error_description = 'user authentication aborted';
  public http_status_code = HttpStatus.BAD_REQUEST;
}
