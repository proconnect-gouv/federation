/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderModule,
  ServiceProviderService,
} from '@fc/service-provider';
import {
  IdentityProviderService,
  IdentityProviderModule,
} from '@fc/identity-provider';
import { MinistriesModule } from '@fc/ministries';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { ErrorModule } from '@fc/error';
import { AccountModule } from '@fc/account';
import { HttpProxyModule } from '@fc/http-proxy';
import { TrackingModule } from '@fc/tracking';
import {
  CoreService,
  CoreTrackingService,
  OidcClientTokenEventHandler,
  UserinfoEventHandler,
  OidcProviderAuthorizationEventHandler,
  OidcProviderTokenEventHandler,
  OidcProviderUserinfoEventHandler,
} from '@fc/core';
const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderService,
  ServiceProviderModule,
);
import { FeatureHandlerModule } from '@fc/feature-handler';
import { CoreFcaController } from './controllers';
import { CoreFcaService } from './services';
import { CoreFcaDefaultVerifyHandler } from './handlers';

@Global()
@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    SessionModule,
    CryptographyModule,
    AccountModule,
    ServiceProviderModule,
    IdentityProviderModule,
    MinistriesModule,
    HttpProxyModule,
    oidcProviderModule,
    OidcClientModule.register(IdentityProviderService, IdentityProviderModule),
    /** Inject app specific tracking service */
    TrackingModule.forRoot(CoreTrackingService),
    FeatureHandlerModule,
  ],
  controllers: [CoreFcaController],
  providers: [
    CoreService,
    CoreFcaService,
    CoreTrackingService,
    OidcClientTokenEventHandler,
    UserinfoEventHandler,
    OidcProviderAuthorizationEventHandler,
    OidcProviderTokenEventHandler,
    OidcProviderUserinfoEventHandler,
    CoreFcaDefaultVerifyHandler,
  ],
  // Make `CoreTrackingService` dependencies available
  exports: [SessionModule, CoreFcaDefaultVerifyHandler],
})
export class CoreFcaModule {}
