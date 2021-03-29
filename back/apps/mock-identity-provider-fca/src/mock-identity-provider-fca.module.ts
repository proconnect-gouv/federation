/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderEnvModule,
  ServiceProviderEnvService,
} from '@fc/service-provider-env';
import { OidcProviderModule } from '@fc/oidc-provider';
import { ErrorModule } from '@fc/error';
import {
  MockIdentityProviderFcaController,
  OidcProviderController,
} from './controllers';
import { MockIdentityProviderFcaService } from './services';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderEnvService,
  ServiceProviderEnvModule,
);

@Module({
  imports: [
    ErrorModule,
    SessionModule,
    ServiceProviderEnvModule,
    oidcProviderModule,
  ],
  controllers: [MockIdentityProviderFcaController, OidcProviderController],
  providers: [MockIdentityProviderFcaService],
})
export class MockIdentityProviderFcaModule {}
