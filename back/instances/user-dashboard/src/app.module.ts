import { Module } from '@nestjs/common';
import { UserDashboardModule, UserDashboardConfig } from '@fc/user-dashboard';
import { ConfigModule } from '@fc/config';
import { LoggerModule } from '@fc/logger';
import configuration from './config';

@Module({
  imports: [
    // 1. Load config module first
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: UserDashboardConfig,
    }),
    // 2. Load logger module next
    LoggerModule,
    // 3. Load other modules
    UserDashboardModule,
  ],
})
export class AppModule {}
