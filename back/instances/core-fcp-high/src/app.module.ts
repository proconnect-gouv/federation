/* istanbul ignore file */

// Declarative code
import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CoreFcpModule } from '@fc/core-fcp';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { CoreFcpHighConfig } from './dto';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: CoreFcpHighConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    CoreFcpModule,
    OverrideOidcProviderModule,
  ],
})
export class AppModule {}
