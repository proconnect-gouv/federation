/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CoreConfig } from '@fc/core';
import { CoreFcaModule } from '@fc/core-fca';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: CoreConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    CoreFcaModule,
  ],
})
export class AppModule {}
