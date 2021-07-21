/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OidcClientConfig } from '@fc/oidc-client';
import { RedisConfig } from '@fc/redis';
import { LoggerConfig } from '@fc/logger';
import { SessionConfig } from '@fc/session';
import { IdentityProviderAdapterEnvConfig } from '@fc/identity-provider-adapter-env';
import { AppConfig } from './app-config.dto';

export class MockServiceProviderConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => AppConfig)
  readonly App: AppConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RedisConfig)
  readonly Redis: RedisConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => LoggerConfig)
  readonly Logger: LoggerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => SessionConfig)
  readonly Session: SessionConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcClientConfig)
  readonly OidcClient: OidcClientConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderAdapterEnvConfig)
  readonly IdentityProviderAdapterEnvConfig: IdentityProviderAdapterEnvConfig;
}
