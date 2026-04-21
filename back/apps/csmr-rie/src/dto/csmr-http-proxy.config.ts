import { AppRmqConfig } from "@fc/app";
import { LoggerConfig, LoggerLegacyConfig } from "@fc/logger";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { Type } from "class-transformer";
import { IsIn, IsObject, ValidateNested } from "class-validator";

export type HttpClient = "axios" | "fetch";

export class CsmrHttpProxyConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => AppRmqConfig)
  readonly App: AppRmqConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => LoggerConfig)
  readonly Logger: LoggerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => LoggerLegacyConfig)
  readonly LoggerLegacy: LoggerLegacyConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RabbitmqConfig)
  readonly HttpProxyBroker: RabbitmqConfig;

  @IsIn(["axios", "fetch"] satisfies HttpClient[])
  readonly httpClient: HttpClient;
}
