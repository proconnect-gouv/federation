import { Module } from '@nestjs/common';
import {
  MockIdentityProviderFcaModule,
  MockIdentityProviderFcaConfig,
} from '@fc/mock-identity-provider-fca';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: MockIdentityProviderFcaConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    MockIdentityProviderFcaModule,
  ],
})
export class AppModule {}
