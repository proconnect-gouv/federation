/* istanbul ignore file */

// declarative code
import { FcException } from '@fc/error';

export class EidasProviderBaseException extends FcException {
  public readonly scope = 7;
}
