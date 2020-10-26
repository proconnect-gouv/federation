/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class OidcClientBaseException extends FcException {
  public readonly scope = 2;
}
