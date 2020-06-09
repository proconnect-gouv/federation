/* istanbul ignore file */

// Declarative code
import { Module, DynamicModule, Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SessionModule, SessionService } from '@fc/session';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { IIdentityProviderService } from './interfaces';
import { OidcClientService } from './oidc-client.service';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityProvider: Type<IIdentityProviderService>,
    identityProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [CqrsModule, identityProviderModule, SessionModule],
      providers: [
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useClass: identityProvider,
        },
        OidcClientService,
        SessionService,
      ],
      exports: [OidcClientService],
      controllers: [OidcClientController],
    };
  }
}
