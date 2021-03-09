/* istanbul ignore file */

// Declarative code
import { IsObject, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoggerConfig } from '@fc/logger';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { CryptographyFcaConfig } from '@fc/cryptography-fca';
import { OidcClientConfig } from '@fc/oidc-client';
import { MongooseConfig } from '@fc/mongoose';
import { RedisConfig } from '@fc/redis';
import { SessionConfig } from '@fc/session';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { AppConfig } from '@fc/app';
import { ServiceProviderConfig } from '@fc/service-provider';
import { IdentityProviderConfig } from '@fc/identity-provider';

export class Core {
  @IsUrl()
  readonly defaultRedirectUri: string;
}

export class CoreFcaConfig {
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
  @Type(() => SessionConfig)
  readonly Session: SessionConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RabbitmqConfig)
  readonly CryptographyBroker: RabbitmqConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => CryptographyFcaConfig)
  readonly CryptographyFca: CryptographyFcaConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OverrideOidcProviderConfig)
  readonly OverrideOidcProvider: OverrideOidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceProviderConfig)
  readonly ServiceProvider: ServiceProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderConfig)
  readonly IdentityProvider: IdentityProviderConfig;
}
