import { Global, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';

import { AccountModule } from '@fc/account';
import { AccountFcaModule } from '@fc/account-fca';
import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { CORE_SERVICE, CoreModule } from '@fc/core';
import { CsrfModule, CsrfService } from '@fc/csrf';
import { DataProviderAdapterMongoModule } from '@fc/data-provider-adapter-mongo';
import { EmailValidatorModule } from '@fc/email-validator/email-validator.module';
import { FlowStepsModule } from '@fc/flow-steps';
import { FqdnToIdpAdapterMongoModule } from '@fc/fqdn-to-idp-adapter-mongo';
import { HttpProxyModule } from '@fc/http-proxy';
import { I18nModule } from '@fc/i18n';
import {
  IdentityProviderAdapterMongoModule,
  IdentityProviderAdapterMongoService,
} from '@fc/identity-provider-adapter-mongo';
import { JwtModule } from '@fc/jwt';
import { MongooseModule } from '@fc/mongoose';
import { NotificationsModule } from '@fc/notifications';
import { OidcAcrModule } from '@fc/oidc-acr';
import { OidcClientModule } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import { OidcProviderModule } from '@fc/oidc-provider';
import {
  ServiceProviderAdapterMongoModule,
  ServiceProviderAdapterMongoService,
} from '@fc/service-provider-adapter-mongo';
import { SessionModule } from '@fc/session';
import { ViewTemplatesModule } from '@fc/view-templates';

import {
  DataProviderController,
  InteractionController,
  OidcClientController,
  OidcProviderController,
} from './controllers';
import {
  CoreFcaFqdnService,
  CoreFcaMiddlewareService,
  CoreFcaService,
  CoreFcaTrackingService,
  DataProviderService,
  IdentitySanitizer,
  OidcProviderConfigAppService,
} from './services';
import { IsPhoneNumberFCAConstraint } from './validators';

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
    DataProviderAdapterMongoModule,
    JwtModule,
    HttpProxyModule,
    OidcAcrModule,
    OidcProviderModule.register(
      OidcProviderConfigAppService,
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
    ),
    OidcClientModule.register(
      IdentityProviderAdapterMongoService,
      IdentityProviderAdapterMongoModule,
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
    ),
    FlowStepsModule,
    NotificationsModule,
    CsrfModule,
    AccountFcaModule,
    ViewTemplatesModule,
    I18nModule,
    CoreModule.register(
      CoreFcaService,
      OidcProviderConfigAppService,
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
      IdentityProviderAdapterMongoService,
      IdentityProviderAdapterMongoModule,
      CoreFcaTrackingService,
    ),
  ],
  controllers: [
    InteractionController,
    OidcClientController,
    OidcProviderController,
    DataProviderController,
  ],
  providers: [
    {
      provide: CORE_SERVICE,
      useClass: CoreFcaService,
    },
    {
      provide: IDENTITY_PROVIDER_SERVICE,
      useExisting: IdentityProviderAdapterMongoService,
    },
    CsrfService,
    OidcProviderConfigAppService,
    CoreFcaService,
    CoreFcaMiddlewareService,
    CoreFcaFqdnService,
    DataProviderService,
    IsPhoneNumberFCAConstraint,
    IdentitySanitizer,
  ],
  exports: [OidcProviderConfigAppService, CqrsModule, CoreFcaService],
})
export class CoreFcaModule {}
