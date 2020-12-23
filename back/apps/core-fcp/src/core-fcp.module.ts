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
import { OidcClientModule } from '@fc/oidc-client';
import { MongooseModule } from '@fc/mongoose';
import { CryptographyModule } from '@fc/cryptography';
import { ErrorModule } from '@fc/error';
import { RnippModule } from '@fc/rnipp';
import { AccountModule } from '@fc/account';
import { HttpProxyModule } from '@fc/http-proxy';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { MailerModule } from '@fc/mailer';
import { TrackingModule } from '@fc/tracking';
import { NotificationsModule, NotificationsService } from '@fc/notifications';
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
  IdentityProviderOperationTypeChangesHandler,
  ServiceProviderOperationTypeChangesHandler,
} from '@fc/core';
import { ScopesModule } from '@fc/scopes';
import { CoreFcpController } from './core-fcp.controller';
import { CoreFcpService } from './core-fcp.service';

const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderService,
  ServiceProviderModule,
);

@Global()
@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    SessionModule,
    RnippModule,
    CryptographyModule,
    AccountModule,
    ServiceProviderModule,
    IdentityProviderModule,
    HttpProxyModule,
    oidcProviderModule,
    ScopesModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
    OidcClientModule.register(IdentityProviderService, IdentityProviderModule),
    MailerModule,
    /** Inject app specific tracking service */
    TrackingModule.forRoot(CoreTrackingService),
    NotificationsModule,
  ],
  controllers: [CoreFcpController],
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
    IdentityProviderOperationTypeChangesHandler,
    ServiceProviderOperationTypeChangesHandler,
    NotificationsService,
  ],
  // Make `CoreTrackingService` dependencies available
  exports: [SessionModule],
})
export class CoreFcpModule {}
