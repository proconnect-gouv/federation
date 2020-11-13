/* istanbul ignore file */

// declarative code
import { FcException } from '@fc/error';

export class EidasClientBaseException extends FcException {
  public readonly scope = 6;
}
