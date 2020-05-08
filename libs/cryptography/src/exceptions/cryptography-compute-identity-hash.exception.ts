import { CryptographyBaseException } from './cryptography-base.exception';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class CryptographyComputeIdentityHashException extends CryptographyBaseException {
  code = ErrorCode.COMPUTE_IDENTITY_HASH;
}
