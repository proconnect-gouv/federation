import { MockIdentityProviderBaseException } from './mock-identity-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class MockIdentityProviderNoAccountException extends MockIdentityProviderBaseException {
  code = ErrorCode.NO_ACCOUNT_FOUND;
}
