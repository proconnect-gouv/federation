import { DynamicModule, Module, ModuleMetadata, Type } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { AccountModule } from '@fc/account';
import {
  ExceptionsModule,
  FcWebHtmlExceptionFilter,
  HttpExceptionFilter,
  UnknownHtmlExceptionFilter,
} from '@fc/exceptions';
import { IServiceProviderAdapter } from '@fc/oidc';
import { OidcAcrModule } from '@fc/oidc-acr';
import { IIdentityProviderAdapter, OidcClientModule } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import {
  IOidcProviderConfigAppService,
  OidcProviderModule,
} from '@fc/oidc-provider';
import {
  OidcProviderRedirectExceptionFilter,
  OidcProviderRenderedHtmlExceptionFilter,
  OidcProviderRenderedJsonExceptionFilter,
} from '@fc/oidc-provider/filters';
import { ExceptionOccurredHandler } from '@fc/oidc-provider/handlers';
import { ServiceProviderAdapterMongoModule } from '@fc/service-provider-adapter-mongo';
import { SessionModule } from '@fc/session';
import { AppTrackingServiceAbstract, TrackingModule } from '@fc/tracking';

import { CoreServiceInterface } from './interfaces';
import {
  CoreAccountService,
  CoreOidcProviderConfigAppService,
} from './services';
import { CORE_SERVICE } from './tokens';

@Module({})
export class CoreModule {
  // More than 4 parameters authorized for dependency injection
  // eslint-disable-next-line max-params
  static register(
    CoreService: Type<CoreServiceInterface>,
    OidcProviderConfigApp: Type<IOidcProviderConfigAppService>,
    ServiceProviderClass: Type<IServiceProviderAdapter>,
    ServiceProviderModule: Type<ModuleMetadata>,
    IdentityProviderAdapterMongoService: Type<IIdentityProviderAdapter>,
    IdentityProviderAdapterMongoModule: Type<ModuleMetadata>,
    AppCoreTrackingService: Type<AppTrackingServiceAbstract>,
  ): DynamicModule {
    const trackingModule = TrackingModule.forRoot(AppCoreTrackingService);

    return {
      module: CoreModule,
      imports: [
        ExceptionsModule,
        ServiceProviderAdapterMongoModule,
        SessionModule,
        OidcAcrModule,
        OidcProviderModule,
        AccountModule,
        OidcProviderModule.register(
          OidcProviderConfigApp,
          ServiceProviderClass,
          ServiceProviderModule,
        ),
        OidcClientModule.register(
          IdentityProviderAdapterMongoService,
          IdentityProviderAdapterMongoModule,
          ServiceProviderClass,
          ServiceProviderModule,
        ),
        IdentityProviderAdapterMongoModule,
        trackingModule,
      ],
      providers: [
        CoreAccountService,
        CoreOidcProviderConfigAppService,
        {
          provide: CORE_SERVICE,
          useExisting: CoreService,
        },
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: IdentityProviderAdapterMongoService,
        },
        ExceptionOccurredHandler,
        UnknownHtmlExceptionFilter,
        OidcProviderRenderedHtmlExceptionFilter,
        OidcProviderRenderedJsonExceptionFilter,
        OidcProviderRedirectExceptionFilter,
        FcWebHtmlExceptionFilter,
        HttpExceptionFilter,
        {
          provide: APP_FILTER,
          useClass: UnknownHtmlExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: OidcProviderRenderedHtmlExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: OidcProviderRedirectExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: FcWebHtmlExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: HttpExceptionFilter,
        },
      ],
      exports: [
        CoreAccountService,
        CoreOidcProviderConfigAppService,
        trackingModule,
      ],
    };
  }
}
