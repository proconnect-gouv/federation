import { Module, DynamicModule, Type } from '@nestjs/common';
import {
  IDP_MANAGEMENT_SERVICE,
  IDENTITY_MANAGEMENT_SERVICE,
  IDENTITY_CHECK_SERVICE,
} from './tokens';
import {
  IIdentityManagementService,
  IIdentityProviderService,
  IIdentityCheckService,
} from './interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityManagementService: Type<IIdentityManagementService>,
    identityManagementModule,
    idpManagementService: Type<IIdentityProviderService>,
    idpManagementModule,
    identityCheckService: Type<IIdentityCheckService>,
    identityCheckModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [
        identityManagementModule,
        idpManagementModule,
        identityCheckModule,
      ],
      providers: [
        {
          provide: IDENTITY_MANAGEMENT_SERVICE,
          useClass: identityManagementService,
        },
        {
          provide: IDENTITY_CHECK_SERVICE,
          useClass: identityCheckService,
        },
        {
          provide: IDP_MANAGEMENT_SERVICE,
          useClass: idpManagementService,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
