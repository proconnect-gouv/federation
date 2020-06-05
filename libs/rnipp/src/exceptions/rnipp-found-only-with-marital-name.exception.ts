import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippFoundOnlyWithMaritalNameException extends RnippBaseException {
  public readonly code = ErrorCode.FOUND_ONLY_WITH_MARITAL_NAME;
  static isBusiness = true;
}
