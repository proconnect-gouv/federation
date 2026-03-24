import { DynamicModule, Module, Type } from "@nestjs/common";

import { IIdentityProviderAdapter } from "./interfaces";
import { OidcClientService } from "./services";
import { IDENTITY_PROVIDER_SERVICE } from "./tokens";

@Module({})
export class OidcClientModule {
  static register(
    identityProvider: Type<IIdentityProviderAdapter>,
    identityProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [identityProviderModule],
      providers: [
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: identityProvider,
        },
        OidcClientService,
      ],
      exports: [OidcClientService],
    };
  }
}
