/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CsmrHsmModule, CsmrHsmConfig } from '@fc/csmr-hsm';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: CsmrHsmConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    CsmrHsmModule,
  ],
})
export class AppModule {}
