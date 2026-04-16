import {
  Controller,
  Get,
  Header,
  HttpStatus,
  Inject,
  Res,
} from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { type Response } from "express";
import { firstValueFrom, timeout } from "rxjs";

@Controller()
export class HealthController {
  constructor(
    @Inject("HttpProxyBroker") private readonly broker: ClientProxy,
  ) {}

  @Get("/livez")
  livez(): string {
    return "ok";
  }

  @Get("/readyz")
  @Header("Content-Type", "text/plain")
  async readyz(@Res({ passthrough: true }) res: Response): Promise<string> {
    try {
      await firstValueFrom(this.broker.emit("ping", {}).pipe(timeout(5000)));
      return "ok";
    } catch (error) {
      res.status(HttpStatus.SERVICE_UNAVAILABLE);
      return "error";
    }
  }
}
