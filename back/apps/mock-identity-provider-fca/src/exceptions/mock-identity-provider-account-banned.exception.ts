import { MockIdentityProviderBaseException } from './mock-identity-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class MockIdentityProviderAccountBannedException extends MockIdentityProviderBaseException {
  code = ErrorCode.ACCOUNT_BANNED;
}
