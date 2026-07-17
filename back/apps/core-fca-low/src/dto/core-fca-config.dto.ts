import { ApiEntrepriseConfig } from "@fc/api-entreprise";
import { EmailValidatorConfig } from "@fc/email-validator/dto";
import { ExceptionsConfig } from "@fc/exceptions/dto";
import { IdentityProviderAdapterMongoConfig } from "@fc/identity-provider-adapter-mongo";
import { LoggerConfig } from "@fc/logger";
import { MailerConfig } from "@fc/mailer/dto";
import { MongooseConfig } from "@fc/mongoose";
import { OidcClientConfig } from "@fc/oidc-client";
import { OidcProviderConfig } from "@fc/oidc-provider";
import { RabbitmqConfig } from "@fc/rabbitmq/dto";
import { RedisConfig } from "@fc/redis";
import { ServiceProviderAdapterMongoConfig } from "@fc/service-provider-adapter-mongo";
import { SessionConfig } from "@fc/session";
import { Type } from "class-transformer";
import { IsObject, ValidateNested } from "class-validator";
import { AppConfig } from "./app-config.dto";

export class CoreFcaConfig {
  @IsObject()
  @ValidateNested()
  @Type(() => AppConfig)
  readonly App: AppConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ApiEntrepriseConfig)
  readonly ApiEntreprise: ApiEntrepriseConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => ExceptionsConfig)
  readonly Exceptions: ExceptionsConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => EmailValidatorConfig)
  readonly EmailValidator: EmailValidatorConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => RabbitmqConfig)
  readonly HyyyperbridgeBroker: RabbitmqConfig;

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
  @Type(() => MailerConfig)
  readonly Mailer: MailerConfig;
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
  @Type(() => ServiceProviderAdapterMongoConfig)
  readonly ServiceProviderAdapterMongo: ServiceProviderAdapterMongoConfig;

  @IsObject()
  @ValidateNested()
  @Type(() => IdentityProviderAdapterMongoConfig)
  readonly IdentityProviderAdapterMongo: IdentityProviderAdapterMongoConfig;
}
