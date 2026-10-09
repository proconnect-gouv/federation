import { AccountFcaModule } from "#libs/account-fca";
import { ApiEntrepriseModule } from "#libs/api-entreprise";
import { AsyncLocalStorageModule } from "#libs/async-local-storage";
import { CachedOrganizationModule } from "#libs/cached-organization";
import { ConfigModule, ConfigService } from "#libs/config";
import { CsrfModule, CsrfService } from "#libs/csrf";
import { EmailValidatorModule } from "#libs/email-validator/email-validator.module";
import { EmailVerificationModule } from "#libs/email-verification";
import {
  BaseExceptionFilter,
  ExceptionsModule,
  HttpExceptionFilter,
  UnknownExceptionFilter,
} from "#libs/exceptions";
import {
  IdentityProviderAdapterMongoModule,
  IdentityProviderAdapterMongoService,
} from "#libs/identity-provider-adapter-mongo";
import { LoggerModule } from "#libs/logger";
import { LoggerRequestPlugin, LoggerSessionPlugin } from "#libs/logger-plugins";
import { MailerModule } from "#libs/mailer";
import { MongooseModule } from "#libs/mongoose";
import { NotificationsModule } from "#libs/notifications";
import { OidcAcrModule } from "#libs/oidc-acr";
import { IDENTITY_PROVIDER_SERVICE, OidcClientModule } from "#libs/oidc-client";
import {
  OidcProviderModule,
  OidcProviderSessionNotFoundExceptionFilter,
} from "#libs/oidc-provider";
import { RedisModule } from "#libs/redis";
import {
  ServiceProviderAdapterMongoModule,
  ServiceProviderAdapterMongoService,
} from "#libs/service-provider-adapter-mongo";
import { SessionModule } from "#libs/session";
import { DynamicModule, Module } from "@nestjs/common";
import { APP_FILTER } from "@nestjs/core";
import { CqrsModule } from "@nestjs/cqrs";
import {
  AccessibilityController,
  EmailVerificationController,
  HealthController,
  InteractionController,
  OidcClientController,
  OidcProviderController,
} from "./controllers";
import { InvalidSessionExceptionFilter } from "./filters";
import {
  CoreFcaControllerService,
  CoreFcaMiddlewareService,
  CoreFcaService,
  IdentitySanitizer,
} from "./services";

@Module({})
export class AppModule {
  static forRoot(configService: ConfigService): DynamicModule {
    return {
      module: AppModule,
      imports: [
        // 1. Load config module first
        ConfigModule.forRoot(configService),
        // 2. Load logger module next
        LoggerModule.forRoot([LoggerRequestPlugin, LoggerSessionPlugin]),
        // 3. Load other modules
        CqrsModule,
        AsyncLocalStorageModule,
        EmailValidatorModule,
        SessionModule,
        MongooseModule.forRoot(),
        MailerModule.forRoot(),
        RedisModule,
        ServiceProviderAdapterMongoModule,
        IdentityProviderAdapterMongoModule,
        OidcAcrModule,
        ExceptionsModule,
        OidcProviderModule.register(
          IdentityProviderAdapterMongoService,
          IdentityProviderAdapterMongoModule,
          ServiceProviderAdapterMongoService,
          ServiceProviderAdapterMongoModule,
        ),
        OidcClientModule.register(
          IdentityProviderAdapterMongoService,
          IdentityProviderAdapterMongoModule,
        ),
        NotificationsModule,
        CsrfModule,
        AccountFcaModule,
        ApiEntrepriseModule,
        CachedOrganizationModule,
        EmailVerificationModule,
      ],
      controllers: [
        AccessibilityController,
        HealthController,
        InteractionController,
        EmailVerificationController,
        OidcClientController,
        OidcProviderController,
      ],
      providers: [
        CoreFcaService,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: IdentityProviderAdapterMongoService,
        },
        CsrfService,
        CoreFcaService,
        CoreFcaMiddlewareService,
        CoreFcaControllerService,
        IdentitySanitizer,
        {
          provide: APP_FILTER,
          useClass: UnknownExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: BaseExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: InvalidSessionExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: OidcProviderSessionNotFoundExceptionFilter,
        },
      ],
    };
  }
}
