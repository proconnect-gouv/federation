import { Module, DynamicModule, Type } from '@nestjs/common';
import { ModuleMetadata } from '@nestjs/common/interfaces';
import { FcExceptionFilter } from '@fc/error';
import { RedisModule } from '@fc/redis';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderController } from './oidc-provider.controller';
import { IIdentityService } from './interfaces/identity-service.interface';
import { IDENTITY_SERVICE } from './tokens/identity-service.token';
import { IServiceProviderService } from './interfaces';
import { SERVICE_PROVIDER_SERVICE } from './tokens/service-provider-service.token';

@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  static register(
    identityClass: Type<IIdentityService>,
    identityModule: Type<ModuleMetadata>,
    serviceProviderClass: Type<IServiceProviderService>,
    serviceProviderModule: Type<ModuleMetadata>,
  ): DynamicModule {
    // does not need to be tested
    // istanbul ignore next
    return {
      module: OidcProviderModule,
      imports: [RedisModule, serviceProviderModule, identityModule],
      providers: [
        FcExceptionFilter,
        {
          provide: IDENTITY_SERVICE,
          useClass: identityClass,
        },
        {
          provide: SERVICE_PROVIDER_SERVICE,
          useClass: serviceProviderClass,
        },
        OidcProviderService,
      ],
      exports: [OidcProviderService],
      controllers: [OidcProviderController],
    };
  }
}
