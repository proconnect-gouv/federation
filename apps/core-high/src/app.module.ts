import { Module } from '@nestjs/common';

import { MongooseModule } from '@fc/mongoose';
import { LoggerModule } from '@fc/logger';
import { ConfigModule } from '@fc/config';
import { CoreFcpConfig, CoreFcpModule } from '@fc/core-fcp';
import configuration from './config';
import { CryptographyModule } from '@fc/cryptography';
import {
  CryptographyGatewayLowModule,
  CryptographyGatewayLowService,
} from '@app/cryptography-gateway-low';

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
    // 3. Load Mongoose module next
    MongooseModule,
    // 4. Load other modules
    CoreFcpModule,
    CryptographyGatewayLowModule,
    CryptographyModule.register(CryptographyGatewayLowService),
  ],
})
export class AppModule {}
