import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyRabbitmqException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.BROKER_RESPONSE;
  public documentation =
    'Une erreur technique est survenue au moment de la récupération des informations à travers le broker rabbitmq';
  public error = 'server_error';
  public error_description =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'BridgeHttpProxy.exceptions.bridgeHttpProxyRabbitmq';
}
