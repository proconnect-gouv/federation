import { Module } from '@nestjs/common';

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
  ],
})
export class ExceptionsModule {}
