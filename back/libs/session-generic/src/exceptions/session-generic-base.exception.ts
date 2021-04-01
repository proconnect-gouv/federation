/* istanbul ignore file */

// declarative code
import { FcException } from '@fc/exceptions';

export class SessionGenericBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 19;
}
