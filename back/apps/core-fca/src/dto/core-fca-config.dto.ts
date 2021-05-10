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
import { SessionGenericConfig } from '@fc/session-generic';
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { AppConfig } from '@fc/app';
import { ServiceProviderAdapterMongoConfig } from '@fc/service-provider-adapter-mongo';
import { IdentityProviderAdapterMongoConfig } from '@fc/identity-provider-adapter-mongo';

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
  @Type(() => SessionGenericConfig)
  readonly SessionGeneric: SessionGenericConfig;

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
  @Type(() => ServiceProviderAdapterMongoConfig)
  readonly ServiceProviderAdapterMongoConfig: ServiceProviderAdapterMongoConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderAdapterMongoConfig)
  readonly IdentityProviderAdapterMongoConfig: IdentityProviderAdapterMongoConfig;
}
