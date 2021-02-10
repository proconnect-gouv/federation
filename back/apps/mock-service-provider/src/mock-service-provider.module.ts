/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionModule } from '@fc/session';
import {
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
} from '@fc/identity-provider-env';
import { ErrorModule } from '@fc/error';
import { CryptographyModule } from '@fc/cryptography';
import {
  ServiceProviderEnvModule,
  ServiceProviderEnvService,
} from '@fc/service-provider-env';
import { MockServiceProviderController } from './mock-service-provider.controller';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderEnvService,
  IdentityProviderEnvModule,
  ServiceProviderEnvService,
  ServiceProviderEnvModule,
);

@Module({
  imports: [
    ErrorModule,
    SessionModule,
    IdentityProviderEnvModule,
    CryptographyModule,
    oidcClientModule,
  ],
  controllers: [MockServiceProviderController],
})
export class MockServiceProviderModule {}
