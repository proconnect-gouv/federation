import { MockServiceProviderBaseException } from './mock-service-provider-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class MockServiceProviderLoginCallbackException extends MockServiceProviderBaseException {
  code = ErrorCode.LOGIN_CALLBACK;
}
