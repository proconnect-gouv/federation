import { FcException } from '@fc/error';

// declarative code
// istanbul ignore next line
export class CryptographyBaseException extends FcException {
  public originalError: Error;
  public readonly scope = 16;

  constructor(error: any) {
    super();
    if (error) {
      this.originalError = error;
    }

    this.message = error.message;

    if (error.error_description) {
      this.message = `${this.message}\n${error.error_description}`;
    }
  }
}
