/* istanbul ignore file */

// Declarative code
import { EidasBridgeBaseException } from './eidas-bridge-base.exception';
import { ErrorCode } from '../enums';

export class EidasBridgeLoginCallbackException extends EidasBridgeBaseException {
  code = ErrorCode.LOGIN_CALLBACK;
}
