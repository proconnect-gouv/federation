/* istanbul ignore file */

// Declarative code
import { Global, Module } from '@nestjs/common';

import { ExceptionsModule } from '@fc/exceptions';
import { RabbitmqModule } from '@fc/rabbitmq';

import { BrokerProxyController } from './controllers';
import { BrokerProxyService } from './services';

@Global()
@Module({
  imports: [ExceptionsModule, RabbitmqModule.registerFor('BridgeProxy')],
  controllers: [BrokerProxyController],
  providers: [BrokerProxyService],
  exports: [],
})
export class RieBridgeProxyModule {}
