import { DynamicModule, Module, Type } from "@nestjs/common";

import { RabbitmqModule } from "@fc/rabbitmq";
import { SessionModule } from "@fc/session";
import { IdentityProviderAdapter } from "./interfaces";
import { OidcClientService } from "./services";

@Module({})
export class OidcClientModule {
  static register(
    identityProvider: Type<IdentityProviderAdapter>,
    identityProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [
        identityProviderModule,
        RabbitmqModule.registerFor("Hyyyperbridge"),
        SessionModule,
      ],
      providers: [
        {
          provide: IdentityProviderAdapter,
          useExisting: identityProvider,
        },
        OidcClientService,
      ],
      exports: [OidcClientService, RabbitmqModule],
    };
  }
}
