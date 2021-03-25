/* istanbul ignore file */

// Declarative code
import { ValidationError } from 'class-validator';
import { CoreBaseException, ErrorCode } from '@fc/core';

export class CoreFcpInvalidIdentityException extends CoreBaseException {
  code = ErrorCode.INVALID_IDENTITY;
  constructor(providerUid: string, errors: Array<ValidationError>) {
    super(
      `Invalid identity from ${providerUid}: ${JSON.stringify(
        errors,
        null,
        2,
      )}`,
    );
  }
}
