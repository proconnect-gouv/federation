import { Global, Module } from '@nestjs/common';

import { AsyncLocalStorageModule } from '@fc/async-local-storage';
import { BaseExceptionModule } from '@fc/base-exception';
import { RabbitmqModule } from '@fc/rabbitmq';

import { BridgeHttpProxyController } from './controllers';
import { BridgeHttpProxyService } from './services';

@Global()
@Module({
  imports: [
    AsyncLocalStorageModule,
    BaseExceptionModule,
    RabbitmqModule.registerFor('BridgeProxy'),
  ],
  controllers: [BridgeHttpProxyController],
  providers: [BridgeHttpProxyService],
  exports: [],
})
export class BridgeHttpProxyModule {}
