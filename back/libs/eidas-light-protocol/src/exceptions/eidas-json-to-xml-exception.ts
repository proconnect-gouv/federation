/* istanbul ignore file */

// declarative code
import { Description } from '@fc/error';
import { ErrorCode } from '../enums';
import { EidasBaseException } from './eidas-base-exception';

@Description(
  "Le Json reçu n'a pas pu être converti en Xml. La structure est invalide ou il manque des éléments essentiels.",
)
export class EidasJsonToXmlException extends EidasBaseException {
  public readonly code = ErrorCode.JSON_TO_XML_EXCEPTION;

  constructor(error) {
    super(error);
    this.originalError = error;
    this.message = error.message;
  }
}
