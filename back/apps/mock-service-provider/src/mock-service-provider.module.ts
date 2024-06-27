/* istanbul ignore file */

// Declarative code
import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AppModule } from '@fc/app';
import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { CryptographyModule } from '@fc/cryptography';
import { CsrfModule } from '@fc/csrf';
import { ExceptionsModule } from '@fc/exceptions-deprecated';
import {
  IdentityProviderAdapterEnvModule,
  IdentityProviderAdapterEnvService,
} from '@fc/identity-provider-adapter-env';
import { OidcClientModule } from '@fc/oidc-client';
import {
  ServiceProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
} from '@fc/service-provider-adapter-env';
import { SessionModule } from '@fc/session';
import { ViewTemplatesModule } from '@fc/view-templates';

import {
  MockServiceProviderController,
  OidcClientController,
} from './controllers';
import { MockServiceProviderService } from './services';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Module({
  imports: [
    AppModule,
    ExceptionsModule.withoutTracking(),
    AsyncLocalStorageModule,
    SessionModule,
    IdentityProviderAdapterEnvModule,
    CryptographyModule,
    oidcClientModule,
    HttpModule,
    ViewTemplatesModule,
    CsrfModule,
  ],
  controllers: [OidcClientController, MockServiceProviderController],
  providers: [MockServiceProviderService],
})
export class MockServiceProviderModule {}
