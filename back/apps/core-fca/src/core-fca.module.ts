import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountModule } from '@fc/account';
import { AccountFcaModule } from '@fc/account-fca';
import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { CsrfModule, CsrfService } from '@fc/csrf';
import { EmailValidatorModule } from '@fc/email-validator/email-validator.module';
import { ExceptionsModule } from '@fc/exceptions';
import { FlowStepsModule } from '@fc/flow-steps';
import { FqdnToIdpAdapterMongoModule } from '@fc/fqdn-to-idp-adapter-mongo';
import { HttpProxyModule } from '@fc/http-proxy';
import {
  IdentityProviderAdapterMongoModule,
  IdentityProviderAdapterMongoService,
} from '@fc/identity-provider-adapter-mongo';
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
import { TrackingModule } from '@fc/tracking';

import {
  InteractionController,
  OidcClientController,
  OidcProviderController,
} from './controllers';
import {
  CoreFcaFqdnService,
  CoreFcaMiddlewareService,
  CoreFcaService,
  IdentitySanitizer,
} from './services';

@Global()
@Module({
  imports: [
    CqrsModule,
    AsyncLocalStorageModule,
    EmailValidatorModule,
    SessionModule,
    MongooseModule.forRoot(),
    AccountModule,
    ServiceProviderAdapterMongoModule,
    IdentityProviderAdapterMongoModule,
    FqdnToIdpAdapterMongoModule,
    HttpProxyModule,
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
    TrackingModule,
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
    CoreFcaFqdnService,
    IdentitySanitizer,
  ],
})
export class CoreFcaModule {}
