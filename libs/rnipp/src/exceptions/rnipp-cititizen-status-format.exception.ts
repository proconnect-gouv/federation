import { RnippBaseException } from './';
import { ErrorCode } from '../enums';

// declarative code
// istanbul ignore next line
export class RnippCitizenStatusFormatException extends RnippBaseException {
  public readonly code = ErrorCode.CITIZEN_STATUS_FORMAT;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
