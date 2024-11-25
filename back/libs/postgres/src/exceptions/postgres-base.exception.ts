/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/exceptions';

export class PostgresBaseException extends FcException {
  static SCOPE = 56;
}
