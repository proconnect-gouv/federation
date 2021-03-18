/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class CoreBaseException extends FcException {
  scope = 0;
}
