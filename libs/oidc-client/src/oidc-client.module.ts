import { Module, DynamicModule } from '@nestjs/common';
import { ImplementationOf } from '@fc/common';
import { IIdentityManagementService } from './interfaces/identity-management-service.interface';
import { IDENTITY_MANAGEMENT_SERVICE } from './tokens/identity-management-service.token';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityManagementClass: ImplementationOf<IIdentityManagementService>,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      providers: [
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useClass: identityManagementClass,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
