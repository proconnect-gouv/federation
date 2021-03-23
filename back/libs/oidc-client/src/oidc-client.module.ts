/* istanbul ignore file */

// Declarative code
import { Module, DynamicModule, Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc';
import { SessionModule, SessionService } from '@fc/session';
import { TrackingModule } from '@fc/tracking';
import { CryptographyModule } from '@fc/cryptography';
import { IServiceProviderService } from '@fc/oidc';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { IIdentityProviderService } from './interfaces';
import {
  OidcClientService,
  OidcClientUtilsService,
  OidcClientConfigService,
  OidcClientIssuerService,
} from './services';
import { OidcClientController } from './oidc-client.controller';

@Module({})
export class OidcClientModule {
  static register(
    identityProvider: Type<IIdentityProviderService>,
    identityProviderModule,
    serviceProvider: Type<IServiceProviderService>,
    serviceProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [
        identityProviderModule,
        serviceProviderModule,
        SessionModule,
        CryptographyModule,
        CqrsModule,
        TrackingModule.forLib(),
      ],
      providers: [
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useClass: identityProvider,
        },
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useExisting: serviceProvider,
        },
        OidcClientUtilsService,
        OidcClientService,
        SessionService,
        OidcClientConfigService,
        OidcClientIssuerService,
      ],
      exports: [OidcClientService, OidcClientConfigService],
      controllers: [OidcClientController],
    };
  }
}
