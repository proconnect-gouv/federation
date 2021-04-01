/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionModule } from '@fc/session';
import {
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
} from '@fc/identity-provider-adapter-env';
import { ExceptionsModule } from '@fc/exceptions';
import { CryptographyModule } from '@fc/cryptography';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { MockServiceProviderController } from './mock-service-provider.controller';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [
    ExceptionsModule,
    SessionModule,
    IdentityProviderAdapterEnvModule,
    CryptographyModule,
    oidcClientModule,
  ],
  controllers: [MockServiceProviderController],
})
export class MockServiceProviderModule {}
