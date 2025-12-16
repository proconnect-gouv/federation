import { DynamicModule, Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountFcaModule } from '@fc/account-fca';
import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { ConfigModule, ConfigService } from '@fc/config';
import { CsrfModule, CsrfService } from '@fc/csrf';
import { EmailValidatorModule } from '@fc/email-validator/email-validator.module';
import {
  ExceptionsModule,
  FcWebHtmlExceptionFilter,
  HttpExceptionFilter,
  UnknownHtmlExceptionFilter,
} from '@fc/exceptions';
import {
  IdentityProviderAdapterMongoModule,
  IdentityProviderAdapterMongoService,
} from '@fc/identity-provider-adapter-mongo';
import { LoggerModule } from '@fc/logger';
import { LoggerRequestPlugin, LoggerSessionPlugin } from '@fc/logger-plugins';
import { MongooseModule } from '@fc/mongoose';
import { NotificationsModule } from '@fc/notifications';
import { OidcAcrModule } from '@fc/oidc-acr';
import { IDENTITY_PROVIDER_SERVICE, OidcClientModule } from '@fc/oidc-client';
import {
  OidcProviderModule,
  OidcProviderSessionNotFoundExceptionFilter,
} from '@fc/oidc-provider';
import {
  ServiceProviderAdapterMongoModule,
  ServiceProviderAdapterMongoService,
} from '@fc/service-provider-adapter-mongo';
import { SessionModule } from '@fc/session';

import {
  InteractionController,
  OidcClientController,
  OidcProviderController,
} from './controllers';
import { InvalidSessionExceptionFilter } from './filters';
import {
  CoreFcaControllerService,
  CoreFcaMiddlewareService,
  CoreFcaService,
  IdentitySanitizer,
} from './services';

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
      ],
      controllers: [
        InteractionController,
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
          useClass: UnknownHtmlExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: FcWebHtmlExceptionFilter,
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
