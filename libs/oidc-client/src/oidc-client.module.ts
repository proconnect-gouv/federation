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
    identity: Type<IIdentityService>,
    identityModule,
    identityProvider: Type<IIdentityProviderService>,
    identityProviderModule,
    identityCheck: Type<IIdentityCheckService>,
    identityCheckModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [identityModule, identityProviderModule, identityCheckModule],
      providers: [
        {
          provide: IDENTITY_SERVICE,
          useClass: identity,
        },
        {
          provide: IDENTITY_CHECK_SERVICE,
          useClass: identityCheck,
        },
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useClass: identityProvider,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
