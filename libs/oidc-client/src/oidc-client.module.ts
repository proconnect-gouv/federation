import { Module, DynamicModule, Type } from '@nestjs/common';
import {
  IDENTITY_PROVIDER_SERVICE,
  IDENTITY_SERVICE,
  IDENTITY_CHECK_SERVICE,
} from './tokens';
import {
  IIdentityService,
  IIdentityProviderService,
  IIdentityCheckService,
} from './interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityService: Type<IIdentityService>,
    identityModule,
    idpService: Type<IIdentityProviderService>,
    idpModule,
    identityCheckService: Type<IIdentityCheckService>,
    identityCheckModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [identityModule, idpModule, identityCheckModule],
      providers: [
        {
          provide: IDENTITY_SERVICE,
          useClass: identityService,
        },
        {
          provide: IDENTITY_CHECK_SERVICE,
          useClass: identityCheckService,
        },
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useClass: idpService,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
