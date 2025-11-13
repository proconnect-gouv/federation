import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyRabbitmqException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.BROKER_RESPONSE;
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
}
