import { UserDashboardBaseException } from './user-dashboard-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class UserDashboardLoginCallbackException extends UserDashboardBaseException {
  code = ErrorCode.LOGIN_CALLBACK;
}
