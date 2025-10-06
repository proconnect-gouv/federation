import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import { TrackingInterceptor } from './interceptors';
import { TrackingService } from './services';

@Module({
  providers: [
    TrackingService,
    {
      provide: APP_INTERCEPTOR,
      useClass: TrackingInterceptor,
    },
  ],
  exports: [TrackingService],
})
export class TrackingModule {}
