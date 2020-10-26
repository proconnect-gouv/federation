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
// Must be imported to be complient with `libs/core` shared between `fcp` and `fca`
import { RnippModule } from '@fc/rnipp';
import { AccountModule } from '@fc/account';
import { HttpProxyModule } from '@fc/http-proxy';
import { MailerModule } from '@fc/mailer';
import { TrackingModule } from '@fc/tracking';
import {
  CoreController,
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

@Global()
@Module({
  imports: [
    ErrorModule,
    MongooseModule,
    SessionModule,
    CryptographyModule,
    AccountModule,
    RnippModule,
    ServiceProviderModule,
    IdentityProviderModule,
    HttpProxyModule,
    oidcProviderModule,
    OidcClientModule.register(IdentityProviderService, IdentityProviderModule),
    MailerModule,
    /** Inject app specific tracking service */
    TrackingModule.forRoot(CoreTrackingService),
  ],
  controllers: [CoreController],
  providers: [
    CoreService,
    CoreTrackingService,
    OidcClientTokenEventHandler,
    UserinfoEventHandler,
    OidcProviderAuthorizationEventHandler,
    OidcProviderTokenEventHandler,
    OidcProviderUserinfoEventHandler,
  ],
  // Make `CoreTrackingService` dependencies available
  exports: [SessionModule],
})
export class CoreFcaModule {}
