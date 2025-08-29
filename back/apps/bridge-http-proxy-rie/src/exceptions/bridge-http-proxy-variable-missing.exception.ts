import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyMissingVariableException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.MISSING_VARIABLE;
  public documentation =
    'Il manque des variables dans la réponse renvoyée par le broker rabbitmq';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'BridgeHttpProxy.exceptions.bridgeHttpProxyVariableMissing';
}
