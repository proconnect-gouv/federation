import { AppRmqConfig } from "@fc/app";
import { LoggerConfig, LoggerLegacyConfig } from "@fc/logger";
import { RabbitmqConfig } from "@fc/rabbitmq";
import { Type } from "class-transformer";
import {
  IsBoolean,
  IsObject,
  IsOptional,
  ValidateNested,
} from "class-validator";

export class HttpProxyBrokerConfig extends RabbitmqConfig {
  @IsBoolean()
  @IsOptional()
  readonly proxyDisabled?: boolean;
}

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
  @Type(() => HttpProxyBrokerConfig)
  readonly HttpProxyBroker: HttpProxyBrokerConfig;
}
