/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class SessionBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 15;
}
