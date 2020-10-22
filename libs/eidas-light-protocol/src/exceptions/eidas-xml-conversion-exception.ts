/* istanbul ignore file */

// declarative code
import { ErrorCode } from '../enums';
import { EidasBaseException } from './eidas-base-exception';

export class EidasXMLConversionException extends EidasBaseException {
  public readonly code = ErrorCode.XML_COULD_NOT_BE_CONVERTED;

  constructor(error) {
    super();
    this.originalError = error;
    this.message = error.message;
  }
}
