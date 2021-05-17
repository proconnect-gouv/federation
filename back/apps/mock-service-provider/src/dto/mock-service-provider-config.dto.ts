/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { OidcClientConfig } from '@fc/oidc-client';
import { RedisConfig } from '@fc/redis';
import { LoggerConfig } from '@fc/logger';
import { SessionGenericConfig } from '@fc/session-generic';
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
  @Type(() => SessionGenericConfig)
  readonly SessionGeneric: SessionGenericConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcClientConfig)
  readonly OidcClient: OidcClientConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderAdapterEnvConfig)
  readonly IdentityProviderAdapterEnvConfig: IdentityProviderAdapterEnvConfig;
}
