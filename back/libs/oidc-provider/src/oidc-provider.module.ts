import { DynamicModule, Module, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';

import { IsUrlRequiredTldFromConfigConstraint } from '@fc/common';
import { IServiceProviderAdapter } from '@fc/oidc';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { OidcAcrModule } from '@fc/oidc-acr';
import { RedisModule } from '@fc/redis';
import { SessionModule } from '@fc/session';

import { OidcProviderController } from './oidc-provider.controller';
import { OidcProviderService } from './oidc-provider.service';
import {
  OidcProviderConfigAppService,
  OidcProviderConfigService,
  OidcProviderErrorService,
} from './services';
import { IsValidPromptConstraint } from './validators';

@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  static register(
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
        OidcAcrModule,
        SessionModule,
      ],
      providers: [
        OidcProviderConfigAppService,
        serviceProviderProvider,
        OidcProviderService,
        IsValidPromptConstraint,
        OidcProviderErrorService,
        OidcProviderConfigService,
        IsUrlRequiredTldFromConfigConstraint,
      ],
      exports: [
        OidcProviderService,
        OidcProviderConfigAppService,
        RedisModule,
        serviceProviderProvider,
        OidcProviderErrorService,
      ],
      controllers: [OidcProviderController],
    };
  }
}
