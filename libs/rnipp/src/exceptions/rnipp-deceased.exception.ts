import { RnippBaseException } from '.';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippDeceasedException extends RnippBaseException {
  public readonly code = ErrorCode.DECEASED;
  static isBusiness = true;
}
