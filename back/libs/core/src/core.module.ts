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
import { IIdentityProviderAdapter } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import { OidcProviderModule } from '@fc/oidc-provider';
import {
  OidcProviderRedirectExceptionFilter,
  OidcProviderRenderedHtmlExceptionFilter,
  OidcProviderRenderedJsonExceptionFilter,
} from '@fc/oidc-provider/filters';
import { ExceptionOccurredHandler } from '@fc/oidc-provider/handlers';
import { ServiceProviderAdapterMongoModule } from '@fc/service-provider-adapter-mongo';
import { SessionModule } from '@fc/session';
import { TrackingModule } from '@fc/tracking';

import { CoreServiceInterface } from './interfaces';
import { CoreAccountService } from './services';
import { CORE_SERVICE } from './tokens';

@Module({})
export class CoreModule {
  // eslint-disable-next-line max-params
  static register(
    CoreService: Type<CoreServiceInterface>,
    ServiceProviderClass: Type<IServiceProviderAdapter>,
    ServiceProviderModule: Type<ModuleMetadata>,
    IdentityProviderAdapterMongoService: Type<IIdentityProviderAdapter>,
    IdentityProviderAdapterMongoModule: Type<ModuleMetadata>,
  ): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ExceptionsModule,
        ServiceProviderAdapterMongoModule,
        SessionModule,
        OidcAcrModule,
        AccountModule,
        OidcProviderModule.register(
          IdentityProviderAdapterMongoService,
          IdentityProviderAdapterMongoModule,
          ServiceProviderClass,
          ServiceProviderModule,
        ),
        IdentityProviderAdapterMongoModule,
        TrackingModule,
      ],
      providers: [
        CoreAccountService,
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
      exports: [CoreAccountService, TrackingModule],
    };
  }
}
