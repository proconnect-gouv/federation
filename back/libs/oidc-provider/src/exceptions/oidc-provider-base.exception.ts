/* istanbul ignore file */

// Declarative code
import { FcException } from '@fc/error';

export class OidcProviderBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 3;

  constructor(error: any) {
    super(error);
    if (error.error_description) {
      this.message = `${this.message}\n${error.error_description}`;
    }
  }
}
