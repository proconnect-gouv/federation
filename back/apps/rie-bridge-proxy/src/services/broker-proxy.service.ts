import { lastValueFrom, timeout } from 'rxjs';

import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

import { validateDto } from '@fc/common';
import { ConfigService, validationOptions } from '@fc/config';
import { LoggerService } from '@fc/logger';
import { HttpProxyProtocol } from '@fc/microservices';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { BridgePayload, BridgeProtocol } from '@fc/rie';

import { BridgeProtocolDto } from '../dto/bridge-protocol.dto';
import {
  RieBrokerProxyMissingVariableException,
  RieBrokerProxyRabbitmqException,
} from '../exceptions';

@Injectable()
export class BrokerProxyService {
  constructor(
    private readonly logger: LoggerService,
    private readonly config: ConfigService,
    @Inject('BridgeProxyBroker') private readonly broker: ClientProxy,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Retrieve informations from RIE through broker
   *
   * @param originalUrl
   * @param method
   * @param headers
   * @param body
   * @returns
   */
  async proxyRequest(
    originalUrl: string,
    method: string,
    headers,
    body?: string,
  ): Promise<BridgeProtocol<object>> {
    let idpResponse: BridgeProtocol<object>;
    const message = this.createMessage(originalUrl, method, headers, body);
    const { requestTimeout } =
      this.config.get<RabbitmqConfig>('BridgeProxyBroker');

    this.logger.debug('BrokerProxyController.proxyRequest()');

    const order = this.broker
      .send(HttpProxyProtocol.Commands.HTTP_PROXY, message)
      .pipe(timeout(requestTimeout));

    try {
      idpResponse = await lastValueFrom(order);
    } catch (error) {
      this.logger.trace({ error });
      throw new RieBrokerProxyRabbitmqException();
    }

    const dtoProtocolErrors = await validateDto(
      idpResponse,
      BridgeProtocolDto,
      validationOptions,
    );

    if (dtoProtocolErrors.length) {
      this.logger.trace({ dtoProtocolErrors });
      throw new RieBrokerProxyMissingVariableException();
    }

    return idpResponse;
  }

  /**
   * Create message to send to broker
   *
   * @param originalUrl
   * @param method
   * @param headers
   * @param body
   * @returns BridgePayload
   */
  private createMessage(
    originalUrl: string,
    method: string,
    headers,
    data?: string,
  ): BridgePayload {
    const { host, 'x-forwarded-proto': xForwardedProto } = headers;
    const url = `${xForwardedProto}://${host}${originalUrl}`;

    return {
      headers,
      method,
      data,
      url,
    };
  }

  /**
   * Set headers into response
   *
   * @param res
   * @param headers
   */
  setHeaders(res, headers: unknown): void {
    Object.entries(headers).forEach(([key, value]) => {
      res.set(key, value);
    });
  }
}
