/* istanbul ignore file */

// Declarative code
import { Module, DynamicModule, Type } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { SERVICE_PROVIDER_SERVICE_TOKEN } from '@fc/oidc';
import { TrackingModule } from '@fc/tracking';
import { CryptographyModule } from '@fc/cryptography';
import { SessionGenericModule } from '@fc/session-generic';
import { IServiceProviderAdapter } from '@fc/oidc';
import { IDENTITY_PROVIDER_SERVICE } from './tokens';
import { IIdentityProviderAdapter } from './interfaces';
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
    identityProvider: Type<IIdentityProviderAdapter>,
    identityProviderModule,
    serviceProvider: Type<IServiceProviderAdapter>,
    serviceProviderModule,
  ): DynamicModule {
    return {
      module: OidcClientModule,
      imports: [
        identityProviderModule,
        serviceProviderModule,
        CryptographyModule,
        CqrsModule,
        TrackingModule.forLib(),
        SessionGenericModule,
      ],
      providers: [
        {
          provide: IDENTITY_PROVIDER_SERVICE,
          useExisting: identityProvider,
        },
        {
          provide: SERVICE_PROVIDER_SERVICE_TOKEN,
          useExisting: serviceProvider,
        },
        OidcClientUtilsService,
        OidcClientService,
        OidcClientConfigService,
        OidcClientIssuerService,
      ],
      exports: [OidcClientService, OidcClientConfigService],
      controllers: [OidcClientController],
    };
  }
}
