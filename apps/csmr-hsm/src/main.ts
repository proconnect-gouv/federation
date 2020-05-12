import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@fc/config';
import { RabbitmqConfig } from '@fc/rabbitmq';
import configuration from './config';
import { CsmrHsmConfig } from './dto';

async function bootstrap() {
  const configOptions = {
    isGlobal: false,
    config: configuration,
    schema: CsmrHsmConfig,
  };
  // First create app context to access configService
  const configService = new ConfigService(configOptions);

  // Fetch broker options from config
  const options = configService.get<RabbitmqConfig>('CryptographyBroker');

  // Create consumer
  const consumer = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options,
    },
  );

  // Launch consumer
  consumer.listen(() =>
    console.log(`Consumer is listening on queue "${options.queue}"`),
  );
}
bootstrap();
