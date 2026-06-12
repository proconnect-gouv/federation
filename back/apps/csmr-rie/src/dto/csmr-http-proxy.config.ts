import { AppRmqConfig } from "@fc/app";
import { LoggerConfig } from "@fc/logger";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { Type } from "class-transformer";
import { IsObject, ValidateNested } from "class-validator";

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
  @Type(() => RabbitmqConfig)
  readonly HttpProxyBroker: RabbitmqConfig;
}
