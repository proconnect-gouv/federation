/* istanbul ignore file */

// Declarative code
import { ErrorCode } from '@fc/core';
import { ValidationError } from 'class-validator';
import { UserDashboardBaseException } from './user-dashboard-base.exception';

export class UserDashboardInvalidIdentityException extends UserDashboardBaseException {
  code = ErrorCode.INVALID_IDENTITY;
  constructor(errors: Array<ValidationError>) {
    super(`Invalid identity from FC: ${JSON.stringify(errors, null, 2)}`);
  }
}
