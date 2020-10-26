/* istanbul ignore file */

// declarative code
import { FcException } from '@fc/error';

export class EidasBaseException extends FcException {
  public readonly scope = 5;
}
