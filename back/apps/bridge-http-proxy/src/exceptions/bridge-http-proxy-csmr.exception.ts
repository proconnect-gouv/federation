import { BridgeError } from '@fc/hybridge-http-proxy';

import { ErrorCode } from '../enums';
import { BridgeHttpProxyBaseException } from './bridge-http-proxy-base.exception';

export class BridgeHttpProxyCsmrException extends BridgeHttpProxyBaseException {
  public code = ErrorCode.CSMR_ERROR;
  public documentation =
    'Une erreur technique est survenue dans le consumer au moment de la récupération des informations à travers le broker rabbitmq';
  static ERROR = 'server_error';
  static ERROR_DESCRIPTION =
    'authentication aborted due to a technical error on the authorization server';
  public ui = 'BridgeHttpProxy.exceptions.bridgeHttpProxyCsmr';

  public reference: number;
  public name: string;
  public reason: string;

  from(error: BridgeError) {
    const { code: reference, name, reason } = error;
    this.reference = reference;
    this.name = name;
    this.reason = reason;
    return this;
  }
}
