import { Module } from '@nestjs/common';
import { InstanceOf } from '@fc/common';
import { OidcProviderService } from './oidc-provider.service';
import { OidcProviderController } from './oidc-provider.controller';
import { IIdentityManagementService } from './interfaces/identity-management-service.interface';
import { IDENTITY_MANAGEMENT_SERVICE } from './tokens/identity-management-service.token';
import { ISpManagementService } from './interfaces/sp-management-service.interface';
import { SP_MANAGEMENT_SERVICE } from './tokens/sp-management-service.token';


@Module({})
export class OidcProviderModule {
  /**
   * Declare a dynamic module in order to be able to inject whichever
   * identity management service we wish.
   * This kind of injection can not be done statically.
   * @see https://docs.nestjs.com/fundamentals/custom-providers
   */
  static register(
    identityManagementServiceClass: InstanceOf<IIdentityManagementService>,
    spManagementServiceClass: InstanceOf<ISpManagementService>,
  ) {
    return {
      module: OidcProviderService,
      providers: [
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useClass: identityManagementServiceClass,
        },
        {
          provide: SP_MANAGEMENT_SERVICE,
          useClass: spManagementServiceClass,
        },
        OidcProviderService,
      ],
      exports: [OidcProviderService],
      controllers: [OidcProviderController],
    };
  }
}
