/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { RedisConfig } from '@fc/redis';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { LoggerConfig } from '@fc/logger';
import { SessionConfig } from '@fc/session';
import { AppConfig } from '@fc/app';
import { CryptographyConfig } from '@fc/cryptography';
/**
 * Rename this librairy into a more appropriate name `adapter`, `mongo`
 * @TODO #246
 * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/246
 */
import { ServiceProviderEnvConfig } from '@fc/service-provider-env';

export class MockIdentityProviderFcaConfig {

  @IsObject()
  @ValidateNested()
  @Type(() => OidcProviderConfig)
  readonly OidcProvider: OidcProviderConfig;

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
  @Type(() => CryptographyConfig)
  readonly Cryptography: CryptographyConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceProviderEnvConfig)
  readonly ServiceProviderEnv: ServiceProviderEnvConfig;
}
