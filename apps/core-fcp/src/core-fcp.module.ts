/* istanbul ignore file */

// Declarative code
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module, Global } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
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
import { CoreFcpController } from './controllers';
import { CoreFcpService, CoreFcpLoggerService } from './services';
import {
  CoreFcpLoggerDebugInterceptor,
  CoreFcpLoggerBusinessInterceptor,
} from './interceptors';
import {
  OidcClientTokenEventHandler,
  UserinfoEventHandler,
  RnippRequestEventHandler,
  RnippReceivedDeceasedEventHandler,
  RnippReceivedValidEventHandler,
  RnippReceivedInvalidEventHandler,
  OidcProviderAuthorizationEventHandler,
  OidcProviderTokenEventHandler,
  OidcProviderUserinfoEventHandler,
} from './handlers';
const oidcProviderModule = OidcProviderModule.register(
  ServiceProviderService,
  ServiceProviderModule,
);

@Global()
@Module({
  imports: [
    ErrorModule,
    CqrsModule,
    MongooseModule,
    SessionModule,
    RnippModule,
    CryptographyModule,
    AccountModule,
    ServiceProviderModule,
    IdentityProviderModule,
    HttpProxyModule,
    oidcProviderModule,
    OverrideOidcProviderModule.register(oidcProviderModule),
    OidcClientModule.register(IdentityProviderService, IdentityProviderModule),
    MailerModule,
  ],
  controllers: [CoreFcpController],
  providers: [
    CoreFcpService,

    CoreFcpLoggerService,
    CoreFcpLoggerDebugInterceptor,
    CoreFcpLoggerBusinessInterceptor,
    OidcClientTokenEventHandler,
    UserinfoEventHandler,
    RnippRequestEventHandler,
    RnippReceivedDeceasedEventHandler,
    RnippReceivedValidEventHandler,
    RnippReceivedInvalidEventHandler,
    OidcProviderAuthorizationEventHandler,
    OidcProviderTokenEventHandler,
    OidcProviderUserinfoEventHandler,
    {
      provide: APP_INTERCEPTOR,
      useClass: CoreFcpLoggerDebugInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: CoreFcpLoggerBusinessInterceptor,
    },
  ],
})
export class CoreFcpModule {}
