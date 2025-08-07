import { ConfigService } from 'nestjs-config';
import { Module, DynamicModule } from '@nestjs/common';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitmqService } from './rabbitmq.service';

@Module({})
export class RabbitmqModule {
  static RABBIT_CLASS_SUFFIX = 'broker';

  private static factory(clientName: string, config: ConfigService) {
    const options = config.get(clientName);
    return ClientProxyFactory.create({
      transport: Transport.RMQ,
      options,
    });
  }

  static registerFor(moduleName: string): DynamicModule {
    const clientName = `${moduleName}-${RabbitmqModule.RABBIT_CLASS_SUFFIX}`;
    const BrokerProvider = {
      provide: clientName,
      useFactory: RabbitmqModule.factory.bind(null, clientName),
      inject: [ConfigService],
    };

    return {
      module: RabbitmqModule,
      providers: [BrokerProvider, RabbitmqService],
      exports: [BrokerProvider, RabbitmqService],
    };
  }
}
