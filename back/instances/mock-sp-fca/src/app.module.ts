import { Module } from '@nestjs/common';
import { MockSpFcaModule, MockSpFcaConfig } from 'apps/mock-sp-fca/src';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: MockSpFcaConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    MockSpFcaModule,
  ],
})
export class AppModule {}
