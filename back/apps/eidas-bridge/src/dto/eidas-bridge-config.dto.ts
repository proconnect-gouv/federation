/* istanbul ignore file */

// Declarative code
import { IsObject, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AppConfig } from '@fc/app';
import { CryptographyConfig } from '@fc/cryptography';
import { IdentityProviderEnvConfig } from '@fc/identity-provider-env';
import { LoggerConfig } from '@fc/logger';
import { OidcClientConfig } from '@fc/oidc-client';
import { RedisConfig } from '@fc/redis';
import { SessionConfig } from '@fc/session';

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

  @IsObject()
  @ValidateNested()
  @Type(() => CryptographyConfig)
  readonly Cryptography: CryptographyConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => LoggerConfig)
  readonly Logger: LoggerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RedisConfig)
  readonly Redis: RedisConfig;

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
  @Type(() => IdentityProviderEnvConfig)
  readonly IdentityProviderEnv: IdentityProviderEnvConfig;
}
