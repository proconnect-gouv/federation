import { DynamicModule, Module, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { ExceptionsModule, FcWebHtmlExceptionFilter } from '@fc/exceptions';
import { IServiceProviderAdapter } from '@fc/oidc';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { OidcAcrModule } from '@fc/oidc-acr';
import { IIdentityProviderAdapter, OidcClientModule } from '@fc/oidc-client';
import { IDENTITY_PROVIDER_SERVICE } from '@fc/oidc-client/tokens';
import { RedisModule } from '@fc/redis';
import { SessionModule } from '@fc/session';
import { TrackingModule } from '@fc/tracking';

import { OidcProviderController } from './oidc-provider.controller';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderConfigAppService,
  OidcProviderConfigService,
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
        FcWebHtmlExceptionFilter,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: IdentityProviderAdapterMongoService,
        },
        OidcProviderConfigAppService,
        serviceProviderProvider,
        OidcProviderService,
        OidcProviderConfigService,
      ],
      exports: [OidcProviderService, RedisModule, serviceProviderProvider],
      controllers: [OidcProviderController],
    };
  }
}
