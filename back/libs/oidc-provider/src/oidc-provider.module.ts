import { DynamicModule, Module, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { APP_FILTER } from '@nestjs/core';

import { IsUrlRequiredTldFromConfigConstraint } from '@fc/common';
import { ExceptionsModule, FcWebHtmlExceptionFilter } from '@fc/exceptions';
import { IServiceProviderAdapter } from '@fc/oidc';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { OidcAcrModule } from '@fc/oidc-acr';
import { IIdentityProviderAdapter, OidcClientModule } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import { RedisModule } from '@fc/redis';
import { SessionModule } from '@fc/session';
import { TrackingModule } from '@fc/tracking';

import {
  OidcProviderRedirectExceptionFilter,
  OidcProviderRenderedHtmlExceptionFilter,
  OidcProviderRenderedJsonExceptionFilter,
} from './filters';
import { ExceptionOccurredHandler } from './handlers';
import { OidcProviderController } from './oidc-provider.controller';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderConfigAppService,
  OidcProviderConfigService,
  OidcProviderErrorService,
} from './services';

@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */

  static register(
    IdentityProviderAdapterMongoService: Type<IIdentityProviderAdapter>,
    IdentityProviderAdapterMongoModule: Type<ModuleMetadata>,
    ServiceProviderClass: Type<IServiceProviderAdapter>,
    ServiceProviderModule: Type<ModuleMetadata>,
  ): DynamicModule {
    const serviceProviderProvider = {
      provide: SERVICE_PROVIDER_SERVICE_TOKEN,
      useExisting: ServiceProviderClass,
    };
    return {
      module: OidcProviderModule,
      imports: [
        RedisModule,
        ServiceProviderModule,
        IdentityProviderAdapterMongoModule,
        OidcAcrModule,
        SessionModule,
        OidcClientModule.register(
          IdentityProviderAdapterMongoService,
          IdentityProviderAdapterMongoModule,
        ),
        TrackingModule,
        ExceptionsModule,
      ],
      providers: [
        ExceptionOccurredHandler,
        OidcProviderRenderedHtmlExceptionFilter,
        OidcProviderRenderedJsonExceptionFilter,
        OidcProviderRedirectExceptionFilter,
        FcWebHtmlExceptionFilter,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: IdentityProviderAdapterMongoService,
        },
        {
          provide: APP_FILTER,
          useClass: OidcProviderRenderedHtmlExceptionFilter,
        },
        {
          provide: APP_FILTER,
          useClass: OidcProviderRedirectExceptionFilter,
        },
        OidcProviderConfigAppService,
        serviceProviderProvider,
        OidcProviderService,
        OidcProviderErrorService,
        OidcProviderConfigService,
        IsUrlRequiredTldFromConfigConstraint,
      ],
      exports: [OidcProviderService, RedisModule, serviceProviderProvider],
      controllers: [OidcProviderController],
    };
  }
}
