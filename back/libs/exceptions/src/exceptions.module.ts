import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';

import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import { SessionModule } from '@fc/session';

import {
  FcWebHtmlExceptionFilter,
  HttpExceptionFilter,
  UnknownHtmlExceptionFilter,
} from './filters';

@Module({
  imports: [SessionModule, ConfigModule, LoggerModule],
  providers: [
    UnknownHtmlExceptionFilter,
    FcWebHtmlExceptionFilter,
    HttpExceptionFilter,
    {
      provide: APP_FILTER,
      useClass: UnknownHtmlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: FcWebHtmlExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class ExceptionsModule {}
