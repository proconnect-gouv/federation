import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoggerConfig } from '@fc/logger';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { OidcClientConfig } from '@fc/oidc-client';
import { MongooseConfig } from '@fc/mongoose';
import { RedisConfig } from '@fc/redis';
import { IdentityManagementConfig } from '@fc/identity-management';

export class CoreFcpConfig {
  @IsObject()
  readonly App: any;

  @IsObject()
  @ValidateNested()
  @Type(() => LoggerConfig)
  readonly Logger: LoggerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcProviderConfig)
  readonly OidcProvider: OidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcClientConfig)
  readonly OidcClient: OidcClientConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => MongooseConfig)
  readonly Mongoose: MongooseConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RedisConfig)
  readonly Redis: RedisConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityManagementConfig)
  readonly IdentityManagement: IdentityManagementConfig;
}
