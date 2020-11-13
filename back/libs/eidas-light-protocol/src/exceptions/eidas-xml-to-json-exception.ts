/* istanbul ignore file */

// declarative code
import { Description } from '@fc/error';
import { ErrorCode } from '../enums';
import { EidasBaseException } from './eidas-base-exception';

@Description(
  "Le Xml reçu n'a pas pu être converti en Json. La structure est invalide ou il manque des éléments essentiels.",
)
export class EidasXmlToJsonException extends EidasBaseException {
  public readonly code = ErrorCode.XML_TO_JSON_EXCEPTION;

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
