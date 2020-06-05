import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippNotFoundMultipleEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_MULTIPLE_ECHO;
  static isBusiness = true;
}
