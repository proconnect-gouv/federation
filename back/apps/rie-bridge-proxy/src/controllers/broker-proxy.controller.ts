import { Body, Controller, Get, Headers, Post, Req, Res } from '@nestjs/common';

import { validateDto } from '@fc/common';
import { validationOptions } from '@fc/config';
import { LoggerService } from '@fc/logger';
import {
  BridgeError,
  BridgeProtocol,
  BridgeResponse,
  MessageType,
} from '@fc/rie';

import { BridgeErrorDto, BridgeResponseDto } from '../dto';
import { RieBridgeProxyRoutes } from '../enums';
import {
  RieBrokerProxyCsmrException,
  RieBrokerProxyMissingVariableException,
} from '../exceptions';
import { BrokerProxyService } from '../services';

@Controller()
export class BrokerProxyController {
  constructor(
    private readonly logger: LoggerService,
    private readonly broker: BrokerProxyService,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  /**
   * Catch all 'GET' routes needed for a cinematic
   * * /.well-known/openid-configuration
   * * /authorize
   * * /userinfo
   * * /jwks
   *
   * @param { originalUrl, method } from req
   * @param headers
   * @param res
   */
  @Get(RieBridgeProxyRoutes.WILDCARD)
  async get(@Req() req, @Headers() headers, @Res() res): Promise<void> {
    const { originalUrl } = req;
    const { host, 'x-forwarded-proto': xForwardedProto } = headers;

    this.logger.debug(`GET ${xForwardedProto}://${host}${originalUrl}`);

    await this.allRequest(req, headers, res);
  }

  /**
   * Catch all 'POST' routes needed for a cinematic
   * * /token
   *
   * @param { originalUrl, method } from req
   * @param headers
   * @param body
   * @param res
   */
  @Post(RieBridgeProxyRoutes.WILDCARD)
  async post(
    @Req() req,
    @Headers() headers,
    @Res() res,
    @Body() body: string,
  ): Promise<void> {
    const { originalUrl } = req;
    const { host, 'x-forwarded-proto': xForwardedProto } = headers;

    this.logger.debug(`POST ${xForwardedProto}://${host}${originalUrl}`);

    await this.allRequest(req, headers, res, body);
  }

  private async allRequest(req, headers, res, body?: string): Promise<void> {
    const { originalUrl, method } = req;

    const response: BridgeProtocol<object> = await this.broker.proxyRequest(
      originalUrl,
      method,
      headers,
      body,
    );

    const { type, data } = response;

    if (type === MessageType.DATA) {
      await this.handleMessage(res, data);
    } else {
      await this.handleError(data);
    }
  }

  async handleMessage(res, message: object) {
    const dtoProtocolErrors = await validateDto(
      message,
      BridgeResponseDto,
      validationOptions,
    );
    if (dtoProtocolErrors.length) {
      throw new RieBrokerProxyMissingVariableException();
    }

    const { headers, data, status } = message as BridgeResponse;

    // set headers with headers return by idp through csmr-rie
    this.broker.setHeaders(res, headers);

    res.status(status).send(data);
  }

  async handleError(error: object) {
    const dtoProtocolErrors = await validateDto(
      error,
      BridgeErrorDto,
      validationOptions,
    );
    if (dtoProtocolErrors.length) {
      throw new RieBrokerProxyMissingVariableException();
    }

    throw new RieBrokerProxyCsmrException(error as BridgeError);
  }
}
