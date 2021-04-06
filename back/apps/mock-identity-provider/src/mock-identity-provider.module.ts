/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { OidcProviderModule } from '@fc/oidc-provider';
import { ExceptionsModule } from '@fc/exceptions';
import { OidcSession } from '@fc/oidc';
import { SessionGenericModule } from '@fc/session-generic';
import {
  MockIdentityProviderController,
  OidcProviderController,
} from './controllers';
import { MockIdentityProviderService } from './services';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [
    ExceptionsModule,
    ServiceProviderAdapterEnvModule,
    SessionGenericModule.forRoot({
      schema: OidcSession,
    }),
    oidcProviderModule,
  ],
  controllers: [MockIdentityProviderController, OidcProviderController],
  providers: [MockIdentityProviderService],
})
export class MockIdentityProviderModule {}
