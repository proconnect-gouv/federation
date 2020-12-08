/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class EidasBridgeBaseException extends FcException {
  scope = 5;
}
