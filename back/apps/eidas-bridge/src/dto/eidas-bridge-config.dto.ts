/* istanbul ignore file */

// Declarative code
import {
  IsObject,
  IsUrl,
  ValidateNested,
  IsArray,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AppConfig } from '@fc/app';
import { CryptographyConfig } from '@fc/cryptography';
import { IdentityProviderEnvConfig } from '@fc/identity-provider-env';
import { ServiceProviderEnvConfig } from '@fc/service-provider-env';
import { LoggerConfig } from '@fc/logger';
import { OidcClientConfig } from '@fc/oidc-client';
import { OidcProviderConfig } from '@fc/oidc-provider';
import { OverrideOidcProviderConfig } from '@fc/override-oidc-provider';
import { RedisConfig } from '@fc/redis';
import { SessionConfig } from '@fc/session';
import { SessionGenericConfig } from '@fc/session-generic';
import { RabbitmqConfig } from '@fc/rabbitmq';
import { EidasClientConfig } from '@fc/eidas-client';
import { EidasProviderConfig } from '@fc/eidas-provider';
import { ApacheIgniteConfig } from '@fc/apache-ignite';
import { EidasLightProtocolConfig } from '@fc/eidas-light-protocol';

export class CountryElement {
  @IsString()
  name: string;
  @IsString()
  iso: string;
  @IsString()
  icon: string;
}

export class Core {
  @IsUrl()
  readonly defaultRedirectUri: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CountryElement)
  readonly countryList: CountryElement[];
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
  @Type(() => SessionGenericConfig)
  readonly SessionGeneric: SessionGenericConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcClientConfig)
  readonly OidcClient: OidcClientConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderEnvConfig)
  readonly IdentityProviderEnv: IdentityProviderEnvConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OidcProviderConfig)
  readonly OidcProvider: OidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => OverrideOidcProviderConfig)
  readonly OverrideOidcProvider: OverrideOidcProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ServiceProviderEnvConfig)
  readonly ServiceProviderEnv: ServiceProviderEnvConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RabbitmqConfig)
  readonly CryptographyBroker: RabbitmqConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => EidasClientConfig)
  readonly EidasClient: EidasClientConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => EidasProviderConfig)
  readonly EidasProvider: EidasProviderConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ApacheIgniteConfig)
  readonly ApacheIgnite: ApacheIgniteConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => EidasLightProtocolConfig)
  readonly EidasLightProtocol: EidasLightProtocolConfig;
}
