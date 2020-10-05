/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { EidasBridgeConfig, EidasBridgeModule } from '@fc/eidas-bridge';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: EidasBridgeConfig,
    }),
    // 3. Load other modules
    EidasBridgeModule,
  ],
})
export class AppModule {}
