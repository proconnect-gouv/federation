/* istanbul ignore file */

// Declarative code
import { IsObject, IsUrl, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CryptographyFcpConfig } from '@fc/cryptography-fcp';
import { CryptographyEidasConfig } from '@fc/cryptography-eidas';
import { LoggerConfig } from '@fc/logger';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { OidcClientConfig } from '@fc/oidc-client';
import { MongooseConfig } from '@fc/mongoose';
import { RedisConfig } from '@fc/redis';
import { RnippConfig } from '@fc/rnipp';
import { SessionConfig } from '@fc/session';
import { ServiceProviderConfig } from '@fc/service-provider';
import { IdentityProviderConfig } from '@fc/identity-provider';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { MailerConfig } from '@fc/mailer';
import { AppConfig } from '@fc/app';

export class Core {
  @IsUrl()
  readonly defaultRedirectUri: string;
}

export class CoreFcpConfig {
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
  @Type(() => RnippConfig)
  readonly Rnipp: RnippConfig;

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
  @Type(() => CryptographyFcpConfig)
  readonly CryptographyFcp: CryptographyFcpConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => CryptographyEidasConfig)
  readonly CryptographyEidas: CryptographyEidasConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OverrideOidcProviderConfig)
  readonly OverrideOidcProvider: OverrideOidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => MailerConfig)
  readonly Mailer: MailerConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceProviderConfig)
  readonly ServiceProvider: ServiceProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderConfig)
  readonly IdentityProvider: IdentityProviderConfig;
}
