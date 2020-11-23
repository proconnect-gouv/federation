import { UserDashboardBaseException } from './user-dashboard-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class UserDashboardTokenRevocationException extends UserDashboardBaseException {
  code = ErrorCode.TOKEN_REVOCATION;
}
