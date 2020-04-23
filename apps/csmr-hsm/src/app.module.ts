import { Module } from '@nestjs/common';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { FakeHsmModule } from '@fc/fake-hsm';
import { AppController } from './app.controller';
import configuration from './config';
import { ErrorModule } from '@fc/error';
import { CsmrHsmConfig } from './dto';

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
    // 3. Load exceptions module
    ErrorModule,
    // 3. Load other modules
    FakeHsmModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
