import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { CqrsModule, EventBus } from '@nestjs/cqrs';

import { ExceptionCaughtHandler } from './handlers';
import { TrackingInterceptor } from './interceptors';
import { CoreTrackingService, TrackingService } from './services';

@Module({
  imports: [CqrsModule],
  providers: [
    TrackingService,
    CoreTrackingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrackingInterceptor,
    },
    ExceptionCaughtHandler,
    EventBus,
  ],
  exports: [TrackingService],
})
export class TrackingModule {}
