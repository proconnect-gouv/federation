/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { EidasCountryModule } from '@fc/eidas-country';
import {
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
} from '@fc/identity-provider-adapter-env';
import { OidcClientModule } from '@fc/oidc-client';
import { OidcProviderModule } from '@fc/oidc-provider';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
} from '@fc/service-provider-adapter-env';
import { CryptographyModule } from '@fc/cryptography';
import { EidasClientController, EidasClientModule } from '@fc/eidas-client';
import {
  EidasProviderController,
  EidasProviderModule,
} from '@fc/eidas-provider';
import { EidasOidcMapperModule } from '@fc/eidas-oidc-mapper';
import { HttpProxyModule } from '@fc/http-proxy';
import {
  FrIdentityToEuController,
  EuIdentityToFrController,
  OidcProviderController,
  OidcClientController,
} from './controllers';
import { EidasBridgeSession } from './dto';
import { OidcMiddlewareService } from './services';

const oidcClientModule = OidcClientModule.register(
  IdentityProviderAdapterEnvService,
  IdentityProviderAdapterEnvModule,
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);
const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderAdapterEnvService,
  ServiceProviderAdapterEnvModule,
);

@Global()
@Module({
  imports: [
    EidasClientModule,
    EidasProviderModule,
    SessionModule.forRoot({
      schema: EidasBridgeSession,
    }),
    IdentityProviderAdapterEnvModule,
    HttpProxyModule,
    ServiceProviderAdapterEnvModule,
    oidcClientModule,
    oidcProviderModule,
    CryptographyModule,
    EidasOidcMapperModule,
    EidasCountryModule,
  ],
  controllers: [
    FrIdentityToEuController,
    EuIdentityToFrController,
    EidasClientController,
    EidasProviderController,
    OidcClientController,
    OidcProviderController,
  ],
  providers: [OidcMiddlewareService],
  exports: [],
})
export class EidasBridgeModule {}
