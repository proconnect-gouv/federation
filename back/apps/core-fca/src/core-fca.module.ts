/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { SessionModule } from '@fc/session';
import {
  ServiceProviderAdapterMongoModule,
  ServiceProviderAdapterMongoService,
} from '@fc/service-provider-adapter-mongo';
import {
  IdentityProviderAdapterMongoService,
  IdentityProviderAdapterMongoModule,
} from '@fc/identity-provider-adapter-mongo';
import { MinistriesModule } from '@fc/ministries';
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyFcaModule } from '@fc/cryptography-fca';
import { ExceptionsModule } from '@fc/exceptions';
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
import { FeatureHandlerModule } from '@fc/feature-handler';
import { CoreFcaController, OidcProviderController } from './controllers';
import { CoreFcaService } from './services';
import { CoreFcaDefaultVerifyHandler } from './handlers';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderAdapterMongoService,
  ServiceProviderAdapterMongoModule,
);

@Global()
@Module({
  imports: [
    ExceptionsModule,
    MongooseModule,
    SessionModule,
    CryptographyFcaModule,
    AccountModule,
    ServiceProviderAdapterMongoModule,
    IdentityProviderAdapterMongoModule,
    MinistriesModule,
    HttpProxyModule,
    oidcProviderModule,
    OidcClientModule.register(
      IdentityProviderAdapterMongoService,
      IdentityProviderAdapterMongoModule,
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
    ),
    /** Inject app specific tracking service */
    TrackingModule.forRoot(CoreTrackingService),
    FeatureHandlerModule,
  ],
  controllers: [CoreFcaController, OidcProviderController],
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
