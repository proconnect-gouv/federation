import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';

import {
  AuthorizeStepFromInterceptor,
  SetStepInterceptor,
} from './interceptors';

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuthorizeStepFromInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: SetStepInterceptor,
    },
  ],
})
export class FlowStepsModule {}
