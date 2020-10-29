/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionModule } from '@fc/session';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import { MockSpFcaController } from './mock-sp-fca.controller';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
);

@Module({
  imports: [SessionModule, IdentityProviderEnvModule, oidcClientModule],
  controllers: [MockSpFcaController],
})
export class MockSpFcaModule {}
