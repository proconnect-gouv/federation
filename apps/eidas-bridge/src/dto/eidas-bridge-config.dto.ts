/* istanbul ignore file */

// Declarative code
import { IsObject, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppConfig } from '@fc/app';

export class Core {
  @IsUrl()
  readonly defaultRedirectUri: string;
}

export class EidasBridgeConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => Core)
  readonly Core: Core;

  @IsObject()
  @ValidateNested()
  @Type(() => AppConfig)
  readonly App: AppConfig;
}
