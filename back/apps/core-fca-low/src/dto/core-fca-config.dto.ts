import { ApiEntrepriseConfig } from "#libs/api-entreprise";
import { EmailValidatorConfig } from "#libs/email-validator/dto/index";
import { EmailVerificationConfig } from "#libs/email-verification";
import { ExceptionsConfig } from "#libs/exceptions/dto/index";
import { IdentityProviderAdapterMongoConfig } from "#libs/identity-provider-adapter-mongo";
import { LoggerConfig } from "#libs/logger";
import { MailerConfig } from "#libs/mailer/dto/index";
import { MongooseConfig } from "#libs/mongoose";
import { OidcClientConfig } from "#libs/oidc-client";
import { OidcProviderConfig } from "#libs/oidc-provider";
import { RabbitmqConfig } from "#libs/rabbitmq/dto/index";
import { RateLimiterConfig } from "#libs/rate-limiter";
import { RedisConfig } from "#libs/redis";
import { ServiceProviderAdapterMongoConfig } from "#libs/service-provider-adapter-mongo";
import { SessionConfig } from "#libs/session";
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
  @Type(() => EmailVerificationConfig)
  readonly EmailVerification: EmailVerificationConfig;

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
  @Type(() => RateLimiterConfig)
  readonly RateLimiter: RateLimiterConfig;

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
