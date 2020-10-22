/* istanbul ignore file */

// declarative code
import { ErrorCode } from '../enums';
import { EidasBaseException } from './eidas-base-exception';

export class EidasJSONConversionException extends EidasBaseException {
  public readonly code = ErrorCode.JSON_COULD_NOT_BE_CONVERTED;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
