import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippNotFoundNoEchoException extends RnippBaseException {
  public readonly code = ErrorCode.NOT_FOUND_NO_ECHO;
  static isBusiness = true;
}
