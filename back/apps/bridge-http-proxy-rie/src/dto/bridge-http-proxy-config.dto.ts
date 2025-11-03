import { Type } from 'class-transformer';
import { IsObject, ValidateNested } from 'class-validator';

import { LoggerConfig, LoggerLegacyConfig } from '@fc/logger';
import { RabbitmqConfig } from '@fc/rabbitmq';

import { AppConfig } from './app-config.dto';

export class BridgeHttpProxyConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => AppConfig)
  readonly App: AppConfig;

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
  readonly BridgeProxyBroker: RabbitmqConfig;
}
