/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CoreFcpConfig, CoreFcpModule } from '@fc/core-fcp';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: CoreFcpConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    CoreFcpModule,
  ],
})
export class AppModule {}
