import { Module } from '@nestjs/common';
import { ConfigModule } from '@fc/config';
import { CoreFcpConfig, CoreFcpModule } from '@fc/core-fcp';
import configuration from './config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      config: configuration,
      schema: CoreFcpConfig,
    }),
    CoreFcpModule,
  ],
})
export class AppModule {}
