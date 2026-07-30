import { LoggerService } from "@fc/logger";
import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Inject,
  Query,
  Res,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { type Response } from "express";
import { firstValueFrom, timeout } from "rxjs";

@Controller()
export class HealthController {
  constructor(
    @Inject("HttpProxyBroker") private readonly broker: ClientProxy,
    private readonly logger: LoggerService,
  ) {}

  @Get("/livez")
  livez(): string {
    return "ok";
  }

  @Get("/readyz")
  @Header("Content-Type", "text/plain")
  async readyz(
    @Res({ passthrough: true }) res: Response,
    @Query("verbose") verbose?: string,
  ): Promise<string> {
    try {
      const pong = await firstValueFrom(
        this.broker.send<string>("ping", {}).pipe(timeout(5000)),
      );
      if (pong !== "pong") {
        throw new Error(`unexpected response: ${pong}`);
      }

      if (verbose !== undefined) {
        return ["[+]broker ok", "readyz check passed"].join("\n");
      }
      return "ok";
    } catch (error) {
      this.logger.error(error);
      res.status(HttpStatus.SERVICE_UNAVAILABLE);

      if (verbose !== undefined) {
        const message =
          error instanceof Error ? error.message : JSON.stringify(error);
        return [`[-]broker failed (${message})`, "readyz check failed"].join(
          "\n",
        );
      }
      return "error";
    }
  }
}
