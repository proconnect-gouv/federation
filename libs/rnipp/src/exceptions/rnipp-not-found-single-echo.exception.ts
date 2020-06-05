import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippNotFoundSingleEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_SINGLE_ECHO;
  static isBusiness = true;
}
