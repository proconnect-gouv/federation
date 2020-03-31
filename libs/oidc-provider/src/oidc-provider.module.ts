import { Module, DynamicModule } from '@nestjs/common';

import { ImplementationOf } from '@fc/common';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderController } from './oidc-provider.controller';
import { IIdentityManagementService } from './interfaces/identity-management-service.interface';
import { IDENTITY_MANAGEMENT_SERVICE } from './tokens/identity-management-service.token';
import { ISpManagementService } from './interfaces/sp-management-service.interface';
import { SP_MANAGEMENT_SERVICE } from './tokens/sp-management-service.token';
import { FcExceptionFilter } from '@fc/error';

@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity management service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  static register(
    identityManagementClass: ImplementationOf<IIdentityManagementService>,
    spManagementClass: ImplementationOf<ISpManagementService>,
    spManagementModule,
  ): DynamicModule {
    // does not need to be tested
    // istanbul ignore next
    return {
      module: OidcProviderModule,
      imports: [spManagementModule],
      providers: [
        FcExceptionFilter,
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useClass: identityManagementClass,
        },
        {
          provide: SP_MANAGEMENT_SERVICE,
          useClass: spManagementClass,
        },
        OidcProviderService,
      ],
      exports: [OidcProviderService],
      controllers: [OidcProviderController],
    };
  }
}
