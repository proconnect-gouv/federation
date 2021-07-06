/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { OidcClientModule } from '@fc/oidc-client';
import { SessionGenericModule } from '@fc/session-generic';
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
import {
  OidcClientController,
  MockServiceProviderController,
} from './controllers';
import { MockServiceProviderSession } from './dto';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [
    ExceptionsModule,
    IdentityProviderAdapterEnvModule,
    SessionGenericModule.forRoot({
      schema: MockServiceProviderSession,
    }),
    CryptographyModule,
    oidcClientModule,
  ],
  controllers: [OidcClientController, MockServiceProviderController],
})
export class MockServiceProviderModule {}
