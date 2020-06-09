/* istanbul ignore file */

// Declarative code
import { APP_INTERCEPTOR } from '@nestjs/core';
import { Module } from '@nestjs/common';
import { ServiceProviderModule } from '@fc/service-provider';
import { CoreFcpLoggerService } from './core-fcp-logger.service';
import { SessionModule } from '@fc/session';
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

@Module({
  imports: [ServiceProviderModule, SessionModule],
  providers: [
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
  exports: [CoreFcpLoggerService],
})
export class CoreFcpLoggerModule {}
