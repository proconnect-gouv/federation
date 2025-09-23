import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TrackingInterceptor } from './interceptors';
import { CoreTrackingService, TrackingService } from './services';

@Module({
  providers: [
    TrackingService,
    CoreTrackingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrackingInterceptor,
    },
  ],
  exports: [TrackingService],
})
export class TrackingModule {}
