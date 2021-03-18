/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class RnippBaseException extends FcException {
  public readonly scope = 1;
}
