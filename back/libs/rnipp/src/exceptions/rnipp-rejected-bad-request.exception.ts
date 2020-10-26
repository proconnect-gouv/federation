import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippRejectedBadRequestException extends RnippBaseException {
  public readonly code = ErrorCode.REJECTED_BAD_REQUEST;
}
