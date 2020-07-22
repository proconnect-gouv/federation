import { MockServiceProviderBaseException } from './mock-service-provider-base.exception';
import { ErrorCode } from '../enums';

export class MockServiceProviderLoginCallbackException extends MockServiceProviderBaseException {
  code = ErrorCode.LOGIN_CALLBACK;
}
