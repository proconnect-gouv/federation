import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyMissingVariableException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.MISSING_VARIABLE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
