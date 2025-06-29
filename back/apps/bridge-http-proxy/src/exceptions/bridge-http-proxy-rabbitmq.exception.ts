import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyRabbitmqException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.BROKER_RESPONSE;
  public documentation =
    'Une erreur technique est survenue au moment de la récupération des informations à travers le broker rabbitmq';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'BridgeHttpProxy.exceptions.bridgeHttpProxyRabbitmq';
}
