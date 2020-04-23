import { NestFactory } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { AppModule } from './app.module';
import { ConfigService } from '@fc/config';
import { RabbitmqConfig } from '@fc/rabbitmq';

async function bootstrap() {
  // First create app context to access configService
  const app = await NestFactory.createApplicationContext(AppModule);
  const configService = app.get(ConfigService);

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
