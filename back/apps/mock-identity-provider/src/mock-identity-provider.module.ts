/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { OidcProviderModule } from '@fc/oidc-provider';
import { ExceptionsModule } from '@fc/exceptions';
import { MockIdentityProviderController } from './controllers';
import { MockIdentityProviderService } from './services';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [
    ExceptionsModule,
    SessionModule,
    ServiceProviderAdapterEnvModule,
    oidcProviderModule,
  ],
  controllers: [MockIdentityProviderController],
  providers: [MockIdentityProviderService],
})
export class MockIdentityProviderModule {}
