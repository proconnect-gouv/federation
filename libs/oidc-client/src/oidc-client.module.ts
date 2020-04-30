import { Module, DynamicModule, Type } from '@nestjs/common';
import { IDENTITY_PROVIDER_SERVICE, IDENTITY_SERVICE } from './tokens';
import { IIdentityService, IIdentityProviderService } from './interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identity: Type<IIdentityService>,
    identityModule,
    identityProvider: Type<IIdentityProviderService>,
    identityProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [identityModule, identityProviderModule],
      providers: [
        {
          provide: IDENTITY_SERVICE,
          useClass: identity,
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
