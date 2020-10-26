import { MockServiceProviderBaseException } from './mock-service-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class MockServiceProviderTokenRevocationException extends MockServiceProviderBaseException {
  code = ErrorCode.TOKEN_REVOCATION;
}
