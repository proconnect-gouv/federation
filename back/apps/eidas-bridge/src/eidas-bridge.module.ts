/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionModule } from '@fc/session';
import { EidasBridgeController } from './controllers';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
);
@Global()
@Module({
  imports: [SessionModule, IdentityProviderEnvModule, oidcClientModule],
  controllers: [EidasBridgeController],
  providers: [],
  // Make `CoreFcpTrackingService` dependencies available
  exports: [],
})
export class EidasBridgeModule {}
