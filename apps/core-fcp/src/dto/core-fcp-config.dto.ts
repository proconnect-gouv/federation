/* istanbul ignore file */

// Declarative code
import { IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { LoggerConfig } from '@fc/logger';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { OidcClientConfig } from '@fc/oidc-client';
import { MongooseConfig } from '@fc/mongoose';
import { RedisConfig } from '@fc/redis';
import { RnippConfig } from '@fc/rnipp';
import { SessionConfig } from '@fc/session';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { CryptographyConfig } from '@fc/cryptography';
import { HttpProxyConfig } from '@fc/http-proxy';
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { MailerConfig } from '@fc/mailer';
import { AppConfig } from '@fc/app';

export class CoreFcpConfig {
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
  @Type(() => CryptographyConfig)
  readonly Cryptography: CryptographyConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => HttpProxyConfig)
  readonly HttpProxy: HttpProxyConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OverrideOidcProviderConfig)
  readonly OverrideOidcProvider: OverrideOidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => MailerConfig)
  readonly Mailer: MailerConfig;
}
