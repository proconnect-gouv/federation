/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import { OidcClientModule } from '@fc/oidc-client';
import { OidcProviderModule } from '@fc/oidc-provider';
import { SessionModule } from '@fc/session';
import { SessionGenericModule } from '@fc/session-generic';
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
import { EidasOidcMapperModule } from '@fc/eidas-oidc-mapper';
import { HttpProxyModule } from '@fc/http-proxy';
import {
  FrIdentityToEuController,
  EuIdentityToFrController,
} from './controllers';
import { EidasBridgeSession } from './dto';

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
    SessionGenericModule.forRoot({
      schema: EidasBridgeSession,
    }),
    IdentityProviderEnvModule,
    HttpProxyModule,
    ServiceProviderEnvModule,
    oidcClientModule,
    oidcProviderModule,
    CryptographyModule,
    EidasOidcMapperModule,
  ],
  controllers: [
    FrIdentityToEuController,
    EuIdentityToFrController,
    EidasClientController,
    EidasProviderController,
  ],
  providers: [],
  // Make `CoreFcpTrackingService` dependencies available
  exports: [],
})
export class EidasBridgeModule {}
