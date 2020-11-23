import { UserDashboardBaseException } from './user-dashboard-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class UserDashboardUserinfoException extends UserDashboardBaseException {
  code = ErrorCode.USERINFO;
}
