import { ValidationException } from "@fc/exceptions";
import {
  BridgeError,
  BridgeProtocol,
  BridgeResponse,
  MessageType,
} from "@fc/hybridge-http-proxy";
import { LoggerService } from "@fc/logger";
import { HttpProxyProtocol } from "@fc/microservices";
import { Controller, Get, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { BridgePayloadDto } from "../dto";

@Controller()
export class CsmrHttpProxyController {
  constructor(private readonly logger: LoggerService) {}

  @Get("/livez")
  healthcheck(): string {
    return "ok";
  }

  @MessagePattern(HttpProxyProtocol.Commands.HTTP_PROXY)
  @UsePipes(
    new ValidationPipe({
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
      exceptionFactory: ValidationException.factory,
    }),
  )
  async proxyRequest(
    @Payload() payload: BridgePayloadDto,
  ): Promise<BridgeProtocol<BridgeResponse | BridgeError>> {
    this.logger.debug({
      msg: `received new ${HttpProxyProtocol.Commands.HTTP_PROXY} command`,
      payload,
    });

    let response;
    try {
      // Workaround for undici issue with Connection header values:
      // > When using undici to make HTTP requests, attempting to send a Connection
      //   header with a value that lists other header names (per RFC 7230 Section 6.1)
      //   results in an InvalidArgumentError: invalid connection header.
      // Reference: https://github.com/nodejs/undici/issues/4774
      if (!["keep-alive", "close"].includes(payload.headers.connection)) {
        delete payload.headers.connection;
      }

      const fetchOptions: RequestInit = {
        method: payload.method,
        headers: new Headers(payload.headers),
        body: payload.data || null,
      };

      const res = await fetch(payload.url, fetchOptions);

      const responseData = await res.text();

      response = {
        type: MessageType.DATA,
        data: {
          status: res.status,
          data: responseData,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
        },
      };
    } catch (error) {
      const errorData = {
        reason: `${error.message}${error?.cause?.message ? ` (${error.cause.message})` : ""}`,
        name: error?.cause?.name || error.name,
        code: error?.cause?.code || error.code,
      };

      this.logger.error({ errorData });

      response = {
        type: MessageType.ERROR,
        data: errorData,
      };
    }

    return response;
  }
}
