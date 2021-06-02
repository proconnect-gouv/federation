/* istanbul ignore file */

// Declarative code
import { DynamicModule, Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CoreFcpModule } from '@fc/core-fcp';
import { OverrideOidcProviderModule } from '@fc/override-oidc-provider';
import { ConfigService } from '@fc/config';

@Module({})
export class AppModule {
  static forRoot(configService: ConfigService): DynamicModule {
    return {
      module: AppModule,
      imports: [
        // 1. Load config module first
        ConfigModule.forRoot(configService),
        // 2. Load logger module next
        LoggerModule,
        // 3. Load other modules
        CoreFcpModule,
        OverrideOidcProviderModule,
      ],
    };
  }
}
