/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import {
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
} from '@fc/identity-provider-adapter-env';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { UserDashboardController } from './user-dashboard.controller';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [IdentityProviderAdapterEnvModule, oidcClientModule],
  controllers: [UserDashboardController],
})
export class UserDashboardModule {}
