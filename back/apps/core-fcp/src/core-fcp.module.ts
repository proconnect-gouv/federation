/* istanbul ignore file */

// Declarative code
import { Module, Global } from '@nestjs/common';
import { OidcProviderModule } from '@fc/oidc-provider';
import { OidcSession } from '@fc/oidc';
import { SessionGenericModule } from '@fc/session-generic';
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
} from '@fc/core';
import { ScopesModule } from '@fc/scopes';
import { FeatureHandlerModule } from '@fc/feature-handler';
import {
  CoreFcpController,
  OidcClientController,
  OidcProviderController,
} from './controllers';
import { CoreFcpService } from './services';
import {
  CoreFcpEidasVerifyHandler,
  CoreFcpDefaultVerifyHandler,
  CoreFcpSendEmailHandler,
  CoreFcpEidasIdentityCheckHandler,
  CoreFcpDefaultIdentityCheckHandler,
  CoreFcpDatatransferInformationIdentityEventHandler,
  CoreFcpDatatransferInformationAnonymousEventHAndler,
  CoreFcpDatatransferConsentIdentityEventHandler,
} from './handlers';

@Global()
@Module({
  imports: [
    ExceptionsModule,
    MongooseModule,
    SessionGenericModule.forRoot({
      schema: OidcSession,
    }),
    RnippModule,
    CryptographyFcpModule,
    CryptographyEidasModule,
    AccountModule,
    ServiceProviderAdapterMongoModule,
    IdentityProviderAdapterMongoModule,
    HttpProxyModule,
    OidcProviderModule.register(
      ServiceProviderAdapterMongoService,
      ServiceProviderAdapterMongoModule,
    ),
    ScopesModule,
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
  controllers: [
    CoreFcpController,
    OidcClientController,
    OidcProviderController,
  ],
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
    CoreFcpDefaultVerifyHandler,
    CoreFcpEidasVerifyHandler,
    CoreFcpSendEmailHandler,
    CoreFcpDefaultIdentityCheckHandler,
    CoreFcpEidasIdentityCheckHandler,
    CoreFcpDatatransferInformationIdentityEventHandler,
    CoreFcpDatatransferInformationAnonymousEventHAndler,
    CoreFcpDatatransferConsentIdentityEventHandler,
  ],
  // Make `CoreTrackingService` dependencies available
  exports: [
    CoreFcpDefaultVerifyHandler,
    CoreFcpEidasVerifyHandler,
    CoreFcpSendEmailHandler,
  ],
})
export class CoreFcpModule {}
