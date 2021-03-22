import { CqrsModule } from '@nestjs/cqrs';
import { Module, DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { RedisModule } from '@fc/redis';
import { SessionModule } from '@fc/session';
import { FcExceptionFilter } from '@fc/error';
import { TrackingModule } from '@fc/tracking';
import { IServiceProviderService } from '@fc/oidc';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc/tokens';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderController } from './oidc-provider.controller';
import { IsValidPromptConstraint } from './validators';
import { OidcProviderErrorService } from './services/oidc-provider-error.service';
import { OidcProviderConfigService } from './services/oidc-provider-config.service';

@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  // does not need to be tested
  // istanbul ignore next
  static register(
    serviceProviderClass: Type<IServiceProviderService>,
    serviceProviderModule: Type<ModuleMetadata>,
  ): DynamicModule {
    const serviceProviderProvider = {
      provide: SERVICE_PROVIDER_SERVICE_TOKEN,
      useExisting: serviceProviderClass,
    };
    return {
      module: OidcProviderModule,
      imports: [
        RedisModule,
        TrackingModule.forLib(),
        serviceProviderModule,
        CqrsModule,
        SessionModule,
      ],
      providers: [
        FcExceptionFilter,
        serviceProviderProvider,
        OidcProviderService,
        IsValidPromptConstraint,
        OidcProviderErrorService,
        OidcProviderConfigService,
      ],
      exports: [
        OidcProviderService,
        RedisModule,
        serviceProviderProvider,
        FcExceptionFilter,
        OidcProviderErrorService,
      ],
      controllers: [OidcProviderController],
    };
  }
}
