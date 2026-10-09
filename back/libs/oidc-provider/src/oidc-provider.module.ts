import { ConfigModule } from "#libs/config";
import { BaseExceptionFilter, ExceptionsModule } from "#libs/exceptions";
import { LoggerModule } from "#libs/logger";
import { IServiceProviderAdapter } from "#libs/oidc";
import { OidcAcrModule } from "#libs/oidc-acr";
import { IIdentityProviderAdapter } from "#libs/oidc-client";
import { IDENTITY_PROVIDER_SERVICE } from "#libs/oidc-client/tokens/index";
import { SERVICE_PROVIDER_SERVICE_TOKEN } from "#libs/oidc/tokens/index";
import { RedisModule } from "#libs/redis";
import { SessionModule } from "#libs/session";
import { DynamicModule, Module, Type } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
import { OidcProviderSessionNotFoundExceptionFilter } from "./filters/oidc-provider-session-not-found-exception.filter";
import { OidcProviderService } from "./oidc-provider.service";
import { OidcProviderConfigService } from "./services";

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
        ConfigModule,
        RedisModule,
        ServiceProviderModule,
        IdentityProviderAdapterMongoModule,
        OidcAcrModule,
        SessionModule,
        ExceptionsModule,
        LoggerModule,
      ],
      providers: [
        BaseExceptionFilter,
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: IdentityProviderAdapterMongoService,
        },
        serviceProviderProvider,
        OidcProviderService,
        OidcProviderConfigService,
        OidcProviderSessionNotFoundExceptionFilter,
      ],
      exports: [OidcProviderService, RedisModule, serviceProviderProvider],
    };
  }
}
