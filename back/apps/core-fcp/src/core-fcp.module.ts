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
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyFcpModule } from '@fc/cryptography-fcp';
import { CryptographyEidasModule } from '@fc/cryptography-eidas';
import { ExceptionsModule } from '@fc/exceptions';
import { RnippModule } from '@fc/rnipp';
import { AccountModule } from '@fc/account';
import { HttpProxyModule } from '@fc/http-proxy';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { MailerModule } from '@fc/mailer';
import { TrackingModule } from '@fc/tracking';
import { NotificationsModule } from '@fc/notifications';
import {
  CoreService,
  CoreTrackingService,
  OidcClientTokenEventHandler,
  UserinfoEventHandler,
  RnippRequestedEventHandler,
  RnippReceivedValidEventHandler,
  OidcProviderAuthorizationEventHandler,
  OidcProviderTokenEventHandler,
  OidcProviderUserinfoEventHandler,
  TrackableEventHandler,
  ServiceProviderOperationTypeChangesHandler,
} from '@fc/core';
import { ScopesModule } from '@fc/scopes';
import { FeatureHandlerModule } from '@fc/feature-handler';
import { CoreFcpController, OidcProviderController } from './controllers';
import { CoreFcpService } from './services';
import {
  CoreFcpEidasVerifyHandler,
  CoreFcpDefaultVerifyHandler,
  CoreFcpSendEmailHandler,
  CoreFcpEidasIdentityCheckHandler,
  CoreFcpDefaultIdentityCheckHandler,
} from './handlers';

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
    RnippModule,
    CryptographyFcpModule,
    CryptographyEidasModule,
    AccountModule,
    ServiceProviderAdapterMongoModule,
    IdentityProviderAdapterMongoModule,
    HttpProxyModule,
    oidcProviderModule,
    ScopesModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
    OidcClientModule.register(
      IdentityProviderAdapterMongoService,
      IdentityProviderAdapterMongoModule,
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
    ),
    MailerModule,
    /** Inject app specific tracking service */
    TrackingModule.forRoot(CoreTrackingService),
    NotificationsModule,
    FeatureHandlerModule,
  ],
  controllers: [CoreFcpController, OidcProviderController],
  providers: [
    CoreService,
    CoreTrackingService,
    CoreFcpService,
    OidcClientTokenEventHandler,
    UserinfoEventHandler,
    RnippRequestedEventHandler,
    RnippReceivedValidEventHandler,
    OidcProviderAuthorizationEventHandler,
    OidcProviderTokenEventHandler,
    OidcProviderUserinfoEventHandler,
    TrackableEventHandler,
    ServiceProviderOperationTypeChangesHandler,
    CoreFcpDefaultVerifyHandler,
    CoreFcpEidasVerifyHandler,
    CoreFcpSendEmailHandler,
    CoreFcpDefaultIdentityCheckHandler,
    CoreFcpEidasIdentityCheckHandler,
  ],
  // Make `CoreTrackingService` dependencies available
  exports: [
    SessionModule,
    CoreFcpDefaultVerifyHandler,
    CoreFcpEidasVerifyHandler,
    CoreFcpSendEmailHandler,
  ],
})
export class CoreFcpModule {}
