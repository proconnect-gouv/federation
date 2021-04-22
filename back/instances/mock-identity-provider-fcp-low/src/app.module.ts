import { Module } from '@nestjs/common';
import {
  MockIdentityProviderModule,
  MockIdentityProviderConfig,
} from '@fc/mock-identity-provider';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: MockIdentityProviderConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    MockIdentityProviderModule,
  ],
})
export class AppModule {}
