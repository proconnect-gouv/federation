import { Module } from '@nestjs/common';

import { LoggerRequestService, LoggerSessionService } from './services';

@Module({
  providers: [LoggerRequestService, LoggerSessionService],
  exports: [LoggerRequestService, LoggerSessionService],
})
export class LoggerPluginsModule {}
