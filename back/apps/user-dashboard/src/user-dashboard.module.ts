/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionModule } from '@fc/session';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import {
  ServiceProviderEnvModule,
  ServiceProviderEnvService,
} from '@fc/service-provider-env';
import { UserDashboardController } from './user-dashboard.controller';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
  ServiceProviderEnvService,
  ServiceProviderEnvModule,
);

@Module({
  imports: [SessionModule, IdentityProviderEnvModule, oidcClientModule],
  controllers: [UserDashboardController],
})
export class UserDashboardModule {}
