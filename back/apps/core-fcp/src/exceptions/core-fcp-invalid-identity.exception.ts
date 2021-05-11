/* istanbul ignore file */

// Declarative code
import { ValidationError } from 'class-validator';
import { CoreBaseException, ErrorCode } from '@fc/core';
/**
 * @todo do not extend class from @fc/core, use a specific BaseException instead
 * This might be done while removing @fc/core altogether in favor of a light code duplication
 * between core-fcp and core-fca.
 */
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
