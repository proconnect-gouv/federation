import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import {
  FcExceptionFilter,
  HttpExceptionFilter,
  UnhandledExceptionFilter,
} from './exception-filters';
import { ErrorService } from './error.service';

@Module({
  providers: [
    ErrorService,
    /**
     * Globally load our custom exception filters
     * @see https://docs.nestjs.com/exception-filters
     */
    {
      provide: APP_FILTER,
      useClass: UnhandledExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: FcExceptionFilter,
    },
  ],
})
export class ErrorModule {}
