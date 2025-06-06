import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { ConfigModule, ConfigService } from '@fc/config';
import { HttpProxyModule } from '@fc/http-proxy';
import { RabbitmqConfig } from '@fc/rabbitmq';

import { rawTransform, validateStatus } from './config';
import { CsmrHttpProxyController } from './controllers';
import { CsmrHttpProxyService } from './services';

@Module({
  imports: [
    HttpModule.registerAsync({
      imports: [ConfigModule, HttpProxyModule, AsyncLocalStorageModule],
      useFactory: (configService: ConfigService) => {
        const { requestTimeout: timeout } =
          configService.get<RabbitmqConfig>('HttpProxyBroker');
        return {
          timeout,
          validateStatus,
          transformResponse: rawTransform,
        };
      },
      inject: [ConfigService],
    }),
  ],
  controllers: [CsmrHttpProxyController],
  providers: [CsmrHttpProxyService],
})
export class CsmrHttpProxyModule {}
