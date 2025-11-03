import { DynamicModule, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountFcaModule } from '@fc/account-fca';
import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { ConfigModule, ConfigService } from '@fc/config';
import { CsrfModule, CsrfService } from '@fc/csrf';
import { EmailValidatorModule } from '@fc/email-validator/email-validator.module';
import { ExceptionsModule } from '@fc/exceptions';
import { FlowStepsModule } from '@fc/flow-steps';
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
import { OidcProviderModule } from '@fc/oidc-provider';
import {
  ServiceProviderAdapterMongoModule,
  ServiceProviderAdapterMongoService,
} from '@fc/service-provider-adapter-mongo';
import { SessionModule } from '@fc/session';

import { InteractionController, OidcClientController } from './controllers';
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
        // The Exceptions module should be imported first so that OidcProvider ExceptionFilters have precedence
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
        FlowStepsModule,
        NotificationsModule,
        CsrfModule,
        AccountFcaModule,
      ],
      controllers: [InteractionController, OidcClientController],
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
      ],
    };
  }
}
