import { ErrorCode } from '../enums';
import { CryptographyBaseException } from './cryptography-base.exception';

export class LowEntropyArgumentException extends CryptographyBaseException {
  public code = ErrorCode.LOW_ENTROPY;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';

  constructor(length: number) {
    super();
    this.log = `Entropy must be at least 32 Bytes for random bytes generation, <${length}> given.`;
  }
}
