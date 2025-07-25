import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { CqrsModule } from '@nestjs/cqrs';

import { BaseException } from '@fc/base-exception';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import { SessionModule } from '@fc/session';

import {
  FcWebHtmlExceptionFilter,
  HttpExceptionFilter,
  UnknownHtmlExceptionFilter,
} from './filters';

@Module({
  imports: [
    CqrsModule,
    SessionModule,
    ConfigModule,
    LoggerModule,
    BaseException,
  ],
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
  exports: [CqrsModule],
})
export class ExceptionsModule {}
