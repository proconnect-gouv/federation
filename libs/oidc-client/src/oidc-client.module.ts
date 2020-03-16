import { Module, DynamicModule } from '@nestjs/common';
import { ImplementationOf } from '@fc/common';
import { IDP_MANAGEMENT_SERVICE, IDENTITY_MANAGEMENT_SERVICE } from './tokens';
import {
  IIdentityManagementService,
  IIdPManagementService,
} from './interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityManagementClass: ImplementationOf<IIdentityManagementService>,
    idpManagementClass: ImplementationOf<IIdPManagementService>,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      providers: [
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useClass: identityManagementClass,
        },
        {
          provide: IDP_MANAGEMENT_SERVICE,
          useClass: idpManagementClass,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
