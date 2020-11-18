/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import { OidcClientModule } from '@fc/oidc-client';
import { OidcProviderModule } from '@fc/oidc-provider';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderEnvService,
  ServiceProviderEnvModule,
} from '@fc/service-provider-env';
import { CryptographyModule } from '@fc/cryptography';
import { EidasClientController, EidasClientModule } from '@fc/eidas-client';
import {
  EidasProviderController,
  EidasProviderModule,
} from '@fc/eidas-provider';
import { EidasBridgeController } from './controllers';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
);
const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderEnvService,
  ServiceProviderEnvModule,
);

@Global()
@Module({
  imports: [
    EidasClientModule,
    EidasProviderModule,
    SessionModule,
    IdentityProviderEnvModule,
    ServiceProviderEnvModule,
    oidcClientModule,
    oidcProviderModule,
    CryptographyModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
  ],
  controllers: [
    EidasBridgeController,
    EidasClientController,
    EidasProviderController,
  ],
  providers: [],
  // Make `CoreFcpTrackingService` dependencies available
  exports: [],
})
export class EidasBridgeModule {}
