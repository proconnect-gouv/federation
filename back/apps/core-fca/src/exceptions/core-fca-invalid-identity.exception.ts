/* istanbul ignore file */

// Declarative code
import { CoreBaseException, ErrorCode } from '@fc/core';
import { ValidationError } from 'class-validator';

export class CoreFcaInvalidIdentityException extends CoreBaseException {
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
