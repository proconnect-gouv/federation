/* istanbul ignore file */

// Declarative code
import { ValidationError } from 'class-validator';
import { ErrorCode } from '@fc/core';
import { EidasBridgeBaseException } from './eidas-bridge-base.exception';

export class EidasBridgeInvalidIdentityException extends EidasBridgeBaseException {
  code = ErrorCode.INVALID_IDENTITY;
  constructor(errors: Array<ValidationError>) {
    super(
      `Invalid identity from eIDAS node: ${JSON.stringify(errors, null, 2)}`,
    );
  }
}
