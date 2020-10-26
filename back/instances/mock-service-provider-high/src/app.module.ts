import { Module } from '@nestjs/common';
import {
  MockServiceProviderModule,
  MockServiceProviderConfig,
} from '@fc/mock-service-provider';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: MockServiceProviderConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    MockServiceProviderModule,
  ],
})
export class AppModule {}
