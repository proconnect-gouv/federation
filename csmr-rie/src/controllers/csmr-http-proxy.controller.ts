import {
  HyyyperbridgeEnveloppeDto,
  HyyyperbridgeMessageType,
} from "@fc/hyyyperbridge";
import { LoggerService } from "@fc/logger";
import { HttpProxyProtocol } from "@fc/microservices";
import { Controller, UsePipes, ValidationPipe } from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { BridgePayloadDto } from "../dto";

@Controller()
export class CsmrHttpProxyController {
  constructor(private readonly logger: LoggerService) {}

  @MessagePattern("ping")
  ping(): string {
    return "pong";
  }

  @MessagePattern(HttpProxyProtocol.Commands.HTTP_PROXY)
  @UsePipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      disableErrorMessages: false,
      validationError: { target: true },
    }),
  )
  async proxyRequest(
    @Payload() payload: BridgePayloadDto,
  ): Promise<HyyyperbridgeEnveloppeDto> {
    this.logger.debug({
      msg: `received new ${HttpProxyProtocol.Commands.HTTP_PROXY} command`,
      payload,
    });

    let response: HyyyperbridgeEnveloppeDto;
    try {
      const fetchOptions: RequestInit = {
        method: payload.method,
        headers: new Headers(payload.headers),
        body: payload.data || null,
      };

      const res = await fetch(payload.url, fetchOptions);

      const responseData = await res.text();

      response = {
        type: HyyyperbridgeMessageType.DATA,
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
        type: HyyyperbridgeMessageType.ERROR,
        data: errorData,
      };
    }

    return response;
  }
}
